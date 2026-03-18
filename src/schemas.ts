import { z } from "zod";

const AtributosSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()])
);

export const ItemInputSchema = z.object({
  titulo: z.string().min(1, "título obrigatório"),
  descricao: z.string().min(1, "descrição obrigatória"),
  categoria: z.enum(["produto", "servico"]),
  preco: z.number().positive().optional(),
  atributos: AtributosSchema.optional().default({}),
});

export const ItemInputListSchema = z
  .array(ItemInputSchema)
  .min(1, "envie ao menos 1 item");

export const QueryBuscaSchema = z.object({
  query_semantica: z.string().min(3, "query_semantica muito curta"),
  categoria: z.enum(["produto", "servico"]),
  filtros: z
    .object({
      preco_max: z.number().positive().nullable().optional(),
      preco_min: z.number().positive().nullable().optional(),
      atributos_exatos: AtributosSchema.optional(),
    })
    .optional(),
  top_k: z.number().int().min(1).max(100).optional().default(10),
});

export type ItemInputValidado = z.infer<typeof ItemInputSchema>;
export type QueryBuscaValidada = z.infer<typeof QueryBuscaSchema>;