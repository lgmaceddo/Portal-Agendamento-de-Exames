import { z } from "zod";

export const officeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  ramal: z.string().min(1, "Ramal é obrigatório"),
  schedule: z.string().min(1, "Horário é obrigatório"),
  specialties: z.array(z.string()).default([]),
  attendants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
    shift: z.string(),
  })).default([]),
  professionals: z.array(z.object({
    name: z.string(),
    specialty: z.string(),
  })).default([]),
  procedures: z.array(z.string()).default([]),
});

export type OfficeFormData = z.infer<typeof officeSchema>;
