import { z } from "zod";

export const examSchema = z.object({
  code: z.string().trim().optional().or(z.literal("")),
  title: z
    .string()
    .trim()
    .min(1, { message: "Nome do exame é obrigatório" })
    .max(200, { message: "Nome deve ter no máximo 200 caracteres" }),
  categoryId: z.string().min(1, { message: "Categoria é obrigatória" }),
  mainLocation: z.enum(["CDU", "HOSPITAL", "EXTERNO"]),
  sectors: z
    .array(z.string())
    .min(1, { message: "Selecione pelo menos um setor" }),
  extension: z
    .string()
    .trim()
    .min(1, { message: "Ramal é obrigatório" })
    .max(50, { message: "Ramal deve ter no máximo 50 caracteres" }),
  additionalInfo: z
    .string()
    .max(2000, { message: "Informações devem ter no máximo 2000 caracteres" })
    .optional()
    .or(z.literal("")),
  rules: z
    .string()
    .max(2000, { message: "As regras devem ter no máximo 2000 caracteres" })
    .optional()
    .or(z.literal("")),
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nome da categoria é obrigatório" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  color: z.string().min(1, { message: "Cor é obrigatória" }),
});

export type ExamFormData = z.infer<typeof examSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
