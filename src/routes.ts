import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import {
  ItemInputListSchema,
  QueryBuscaSchema,
  type ItemInputValidado,
} from "./schemas";
import {
  gerarEmbedding,
  gerarEmbeddingsLote,
  construirTextoIndexacao,
} from "./embedding.service";
import { indexarPontos, buscar, infoCollection } from "./qdrant.service";
import type { ItemPayload } from "./types";

export const router = Router();

// ─── GET /health ──────────────────────────────────────────────────────────────

router.get("/health", async (_req: Request, res: Response) => {
  try {
    const info = await infoCollection();
    res.json({
      status: "ok",
      collection: info.config,
      vetores_indexados: info.indexed_vectors_count,
    });
  } catch (err) {
    res.status(500).json({ status: "error", detalhe: String(err) });
  }
});

// ─── POST /items ──────────────────────────────────────────────────────────────
/**
 * Popula a collection com uma lista de itens.
 *
 * Body: ItemInput[]
 *
 * Exemplo:
 * [
 *   {
 *     "titulo": "Bateria Moura 60Ah",
 *     "descricao": "Bateria automotiva selada 12V 60Ah para veículos leves",
 *     "categoria": "produto",
 *     "preco": 459.90,
 *     "atributos": { "marca": "Moura", "capacidade_ah": 60, "voltagem": 12 }
 *   }
 * ]
 */
router.post("/items", async (req: Request, res: Response) => {
  // 1. Validação
  const parsed = ItemInputListSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() });
    return;
  }

  const items: ItemInputValidado[] = parsed.data;

  // 2. Monta textos para embedding em lote
  const textos = items.map((item) =>
    construirTextoIndexacao({
      titulo: item.titulo,
      descricao: item.descricao,
      atributos: item.atributos,
    })
  );

  let vectors: number[][];
  try {
    vectors = await gerarEmbeddingsLote(textos);
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Falha ao gerar embeddings", detalhe: String(err) });
    return;
  }

  // 3. Monta pontos para o Qdrant
  const pontos = items.map((item, i) => {
    const payload: ItemPayload = {
      titulo: item.titulo,
      descricao: item.descricao,
      categoria: item.categoria,
      preco: item.preco,
      atributos: item.atributos ?? {},
      texto_indexado: textos[i],
      criado_em: new Date().toISOString(),
    };

    return {
      id: randomUUID(),
      vector: vectors[i],
      payload,
    };
  });

  // 4. Indexa no Qdrant
  try {
    await indexarPontos(pontos);
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Falha ao indexar no Qdrant", detalhe: String(err) });
    return;
  }

  res.status(201).json({
    mensagem: `${pontos.length} item(s) indexado(s) com sucesso`,
    ids: pontos.map((p) => p.id),
  });
});

// ─── POST /busca ──────────────────────────────────────────────────────────────
/**
 * Busca semântica com filtros estruturados.
 *
 * Body: QueryBusca
 *
 * Exemplo:
 * {
 *   "query_semantica": "bateria automotiva 12V alta durabilidade para carro popular",
 *   "categoria": "produto",
 *   "filtros": {
 *     "preco_max": 600,
 *     "preco_min": 200,
 *     "atributos_exatos": {
 *       "marca": "Moura",
 *       "voltagem": 12,
 *        ...
 *     }
 *   },
 *   "top_k": 5
 * }
 *
 */
router.post("/busca", async (req: Request, res: Response) => {
  // 1. Validação
  const parsed = QueryBuscaSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ erro: "Query inválida", detalhes: parsed.error.flatten() });
    return;
  }

  const query = parsed.data;

  // 2. Gera embedding da query semântica
  let queryVector: number[];
  try {
    queryVector = await gerarEmbedding(query.query_semantica);
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Falha ao vetorizar query", detalhe: String(err) });
    return;
  }

  // 3. Busca no Qdrant
  let resultados;
  try {
    resultados = await buscar(queryVector, query);
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ erro: "Falha na busca", detalhe: err?.message });
    return;
  }

  // 4. Monta resposta com debug info
  res.json({
    query: {
      semantica: query.query_semantica,
      categoria: query.categoria,
      filtros: query.filtros ?? null,
    },
    total: resultados.length,
    resultados,
  });
});
