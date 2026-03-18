import { QdrantClient, Schemas } from "@qdrant/js-client-rest";
import type { ItemPayload, QueryBusca, ResultadoBusca } from "./types";

const QDRANT_URL = process.env.QDRANT_URL!;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY!;
const COLLECTION = process.env.QDRANT_COLLECTION ?? "catalogo";
const VECTOR_SIZE = parseInt(process.env.EMBEDDING_DIMENSION ?? "384");

if (!QDRANT_URL || !QDRANT_API_KEY) {
  throw new Error("QDRANT_URL e QDRANT_API_KEY são obrigatórios no .env");
}

export const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

// ─── Setup da Collection ──────────────────────────────────────────────────────

/**
 * Cria a collection no Qdrant se ainda não existir.
 *
 * Modelagem dos índices de payload:
 *  - categoria   → keyword  (filtragem MUST exata)
 *  - preco       → float    (filtragem por range)
 *  - atributos.* → indexados dinamicamente em runtime via upsert
 */
export async function garantirCollection(): Promise<void> {
  console.log("[Qdrant] Inicializando collection no Qdrant...");
  const collections = await qdrant.getCollections();
  const existe = collections.collections.some((c) => c.name === COLLECTION);

  if (!existe) {
    console.log(`[Qdrant] Criando collection "${COLLECTION}"...`);
    await qdrant.createCollection(COLLECTION, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
      hnsw_config: { m: 16, ef_construct: 100 },
      optimizers_config: { default_segment_number: 2 },
    });
  }

  await garantirIndicePadrao("categoria", "keyword");
  await garantirIndicePadrao("preco", "float");

  // Garantir índices para os atributos dinâmicos mais comuns (exemplo: marca, voltagem, tamanho, unidade_tamanho)
  const atributosComuns: [string, "keyword" | "integer" | "float" | "bool"][] =
    [
      ["marca", "keyword"],
      ["voltagem", "integer"],
      ["tamanho", "float"],
      ["unidade_tamanho", "keyword"],
    ];

  for (const [campo, tipo] of atributosComuns) {
    await garantirIndicePadrao(`atributos.${campo}`, tipo);
  }

  console.log(`[Qdrant] Collection "${COLLECTION}" pronta.`);
}

async function garantirIndicePadrao(
  field_name: string,
  field_schema: "keyword" | "float" | "integer" | "bool"
): Promise<void> {
  try {
    await qdrant.createPayloadIndex(COLLECTION, {
      field_name,
      field_schema,
      ordering: "weak",
    });
  } catch {}
}

// ─── Indexação ────────────────────────────────────────────────────────────────

export interface PontoParaIndexar {
  id: string; // UUID string — Qdrant Cloud aceita UUID diretamente
  vector: number[];
  payload: ItemPayload;
}

/**
 * Insere/atualiza pontos na collection (upsert = insert or update by id).
 * Antes de inserir, garante que os índices dos atributos dinâmicos existam.
 */
export async function indexarPontos(pontos: PontoParaIndexar[]): Promise<void> {
  // 1. Coleta atributos únicos para criar índices sob demanda
  const atributosVistos = new Map<
    string,
    "keyword" | "integer" | "float" | "bool"
  >();

  for (const ponto of pontos) {
    for (const [chave, valor] of Object.entries(ponto.payload.atributos)) {
      if (!atributosVistos.has(chave)) {
        atributosVistos.set(chave, inferirTipoQdrant(valor));
      }
    }
  }

  // 2. Upsert em lote com wait: true (aguarda confirmação do Qdrant)
  //    Igual ao padrão do seu repository: vectorStore.client().delete(..., { wait: true })
  await qdrant.upsert(COLLECTION, {
    wait: true,
    points: pontos.map((p) => ({
      id: p.id, // UUID string direto — sem hash numérico
      vector: p.vector,
      payload: p.payload as unknown as Record<string, unknown>,
    })),
  });
}

// ─── Busca ────────────────────────────────────────────────────────────────────

/**
 * Executa busca semântica com filtros estruturados.
 *
 * Estrutura do Filter Qdrant:
 * {
 *   must: [
 *     { key: "categoria", match: { value: "produto" } }   ← OBRIGATÓRIO
 *     { key: "preco", range: { gte: 100, lte: 500 } }     ← se informado
 *   ],
 *   should: [
 *     { key: "atributos.marca",    match: { value: "Moura" } },
 *     { key: "atributos.voltagem", match: { value: 12 } },
 *     ...N atributos...
 *   ]
 * }
 *
 * O SHOULD no Qdrant NÃO elimina resultados — ele adiciona score extra
 * para quem satisfaz a condição. Itens que atendem mais condições SHOULD
 * ficam mais acima no ranking (combinado com a similaridade vetorial).
 */
export async function buscar(
  queryVector: number[],
  query: QueryBusca
): Promise<ResultadoBusca[]> {
  const { categoria, filtros, top_k = 5 } = query;

  const mustClauses: Schemas["Filter"]["must"] = [
    { key: "categoria", match: { value: categoria } },
  ];

  if (filtros?.preco_min != null || filtros?.preco_max != null) {
    const range: Record<string, number> = {};
    if (filtros.preco_min != null) range["gte"] = filtros.preco_min;
    if (filtros.preco_max != null) range["lte"] = filtros.preco_max;
    mustClauses.push({ key: "preco", range });
  }

  const filter: Schemas["Filter"] = { must: mustClauses };
  const atributos = filtros?.atributos_exatos
    ? Object.entries(filtros.atributos_exatos)
    : [];

  if (atributos.length === 0) {
    const res = await qdrant.query(COLLECTION, {
      query: queryVector,
      filter,
      limit: top_k,
      with_payload: true,
      with_vector: false,
      score_threshold: 0.2,
    });
    return mapearResultados(res.points);
  }

  const pesoSemantica = 0.4;
  const pesoPorAtributo = 0.6 / atributos.length;

  const formulaSum: any[] = [
    { mult: [pesoSemantica, "$score"] },
    ...atributos.map(([chave, valor]) => ({
      mult: [
        pesoPorAtributo,
        { key: `atributos.${chave}`, match: { value: valor } },
      ],
    })),
  ];

  const res = await qdrant.query(COLLECTION, {
    prefetch: {
      query: queryVector,
      filter: {
        must: mustClauses,
        should: [
          // Caminho 1: tem atributos e pelo menos 1 bate
          {
            min_should: {
              conditions: atributos.map(([chave, valor]) => ({
                key: `atributos.${chave}`,
                match: { value: valor },
              })),
              min_count: 1,
            },
          },
          // Caminho 2: não tem nenhum dos atributos filtrados (item sem metadados)
          {
            must_not: atributos.map(([chave]) => ({
              is_empty: { key: `atributos.${chave}` },
            })),
          },
        ],
      },
      limit: top_k * 10,
    },
    query: { formula: { sum: formulaSum } },
    limit: top_k,
    with_payload: true,
    with_vector: false,
  });

  return mapearResultados(res.points);
}

function mapearResultados(points: any[]): ResultadoBusca[] {
  return points
    .filter((r) => (r.score ?? 0) >= 0.15)
    .map((r) => {
      const p = r.payload as unknown as ItemPayload;
      return {
        id: r.id,
        score: r.score ?? 0,
        titulo: p.titulo,
        descricao: p.descricao,
        categoria: p.categoria,
        preco: p.preco,
        atributos: p.atributos,
      };
    });
}

function inferirTipoQdrant(
  valor: string | number | boolean
): "keyword" | "integer" | "float" | "bool" {
  if (typeof valor === "boolean") return "bool";
  if (typeof valor === "string") return "keyword";
  if (Number.isInteger(valor)) return "integer";
  return "float";
}

export async function infoCollection() {
  return qdrant.getCollection(COLLECTION);
}
