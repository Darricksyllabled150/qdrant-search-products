export type Categoria = "produto" | "servico";

export type AtributosExatos = Record<string, string | number | boolean>;

export interface ItemPayload {
  titulo: string;
  descricao: string;
  categoria: Categoria;
  preco?: number;
  atributos: AtributosExatos;
  texto_indexado: string;
  criado_em: string;
}

export interface ItemInput {
  titulo: string;
  descricao: string;
  categoria: Categoria;
  preco?: number;
  atributos?: AtributosExatos;
}

export interface FiltrosBusca {
  preco_max?: number | null;
  preco_min?: number | null;
  atributos_exatos?: AtributosExatos;
}

export interface QueryBusca {
  query_semantica: string;
  categoria: Categoria;
  filtros?: FiltrosBusca;
  top_k?: number;
}

export interface ResultadoBusca {
  id: string | number;
  score: number;
  titulo: string;
  descricao: string;
  categoria: Categoria;
  preco?: number;
  atributos: AtributosExatos;
}
