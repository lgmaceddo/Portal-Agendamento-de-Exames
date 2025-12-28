import { z } from "zod";

export const valueSchema = z.object({
  categoryId: z.string().min(1, "Selecione uma categoria"),
  codigo: z.string().min(1, "Código é obrigatório"),
  nome: z.string().min(1, "Nome do exame é obrigatório"),
  honorario: z.number().min(0, "Honorário deve ser maior ou igual a zero"),
  exame_cartao: z.number().min(0, "Exame (Cartão) deve ser maior ou igual a zero"),
  material_min: z.number().min(0, "Valor mínimo do material inválido"),
  material_max: z.number().min(0, "Valor máximo do material inválido"),
  info: z.string().optional(),
});

export const valueCategorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório"),
  color: z.string().min(1, "Cor é obrigatória"),
});
