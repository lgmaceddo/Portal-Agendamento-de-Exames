import { z } from "zod";

export const scriptSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Título é obrigatório" })
    .max(200, { message: "Título deve ter no máximo 200 caracteres" }),
  content: z
    .string()
    .trim()
    .min(1, { message: "Conteúdo é obrigatório" })
    .max(5000, { message: "Conteúdo deve ter no máximo 5000 caracteres" }),
  categoryId: z.string().min(1, { message: "Categoria é obrigatória" }),
  order: z
    .number()
    .int()
    .min(1, { message: "Ordem deve ser um número positivo" })
    .optional()
    .or(z.literal(undefined)),
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nome da categoria é obrigatório" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  color: z.string().min(1, { message: "Cor é obrigatória" }),
});

export type ScriptFormData = z.infer<typeof scriptSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;