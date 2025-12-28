import { z } from "zod";

export const contactSchema = z.object({
  setor: z
    .string()
    .trim()
    .min(1, { message: "Setor é obrigatório" })
    .max(200, { message: "Setor deve ter no máximo 200 caracteres" }),
  local: z
    .string()
    .trim()
    .max(200, { message: "Local deve ter no máximo 200 caracteres" })
    .optional(),
  ramal: z
    .string()
    .trim()
    .max(100, { message: "Ramal deve ter no máximo 100 caracteres" })
    .optional(),
  telefone: z
    .string()
    .trim()
    .max(50, { message: "Telefone deve ter no máximo 50 caracteres" })
    .optional(),
  whatsapp: z
    .string()
    .trim()
    .max(50, { message: "WhatsApp deve ter no máximo 50 caracteres" })
    .optional(),
  categoryId: z.string().optional(), // Tornando opcional, pois será injetado no handler
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nome da categoria é obrigatório" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  color: z.string().min(1, { message: "Cor é obrigatória" }),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;