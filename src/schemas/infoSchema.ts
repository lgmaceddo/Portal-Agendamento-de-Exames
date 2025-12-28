import { z } from "zod";

export const infoTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nome da etiqueta é obrigatório" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  color: z.string().min(1, { message: "Cor é obrigatória" }),
});

export const infoItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Título é obrigatório" })
    .max(200, { message: "Título deve ter no máximo 200 caracteres" }),
  content: z
    .string()
    .trim()
    .min(1, { message: "Conteúdo é obrigatório" })
    .max(10000, { message: "Conteúdo deve ter no máximo 10000 caracteres" }),
  tagId: z.string().min(1, { message: "Etiqueta é obrigatória" }),
  attachments: z.array(z.object({
    id: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    dataUrl: z.string(),
    size: z.number(),
  })).optional(),
});

export type InfoTagFormData = z.infer<typeof infoTagSchema>;
export type InfoItemFormData = z.infer<typeof infoItemSchema>;