export type NoticeTag = "URGENTE" | "FLUXO" | "SISTEMA" | "GERAL" | "TREINAMENTO";

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  tag: NoticeTag; // Novo campo para categorização
  icon?: string;
}