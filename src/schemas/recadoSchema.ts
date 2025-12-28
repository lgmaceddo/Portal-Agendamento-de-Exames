import { z } from "zod";

export const recadoCategorySchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(100, "Máximo de 100 caracteres"),
  description: z.string().trim().min(1, "Descrição é obrigatória").max(500, "Máximo de 500 caracteres"),
  destinationType: z.enum(['attendant', 'group']),
  groupName: z.string().optional(),
  attendants: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    chatNick: z.string().min(1),
  })).optional(),
}).refine(data => {
  if (data.destinationType === 'group' && !data.groupName?.trim()) {
    return false;
  }
  if (data.destinationType === 'attendant' && (!data.attendants || data.attendants.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "O nome do grupo ou pelo menos um atendente é obrigatório.",
  path: ["groupName"],
});

export const recadoItemSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(100, "Máximo de 100 caracteres"),
  content: z.string().trim().min(1, "Conteúdo é obrigatório").max(5000, "Máximo de 5000 caracteres"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  fields: z.array(z.string()).default([]),
});

export type RecadoCategoryFormData = z.infer<typeof recadoCategorySchema>;
export type RecadoItemFormData = z.infer<typeof recadoItemSchema>;