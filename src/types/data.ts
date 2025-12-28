export interface Category {
  id: string;
  name: string;
  color: string;
  view_type?: string; // Adicionado para mapear a coluna view_type na tabela categories
}

export interface ScriptItem {
  id: string;
  title: string;
  content: string;
  order?: number;
  category_id: string; // Adicionado para mapear a FK
}

export interface SchedulingRule {
  type: 'indication' | 'restriction';
  fromDoctor: string;
  toDoctor: string;
  fromGender?: 'masculino' | 'feminino';
  toGender?: 'masculino' | 'feminino';
}

export interface ExamItem {
  id: string;
  code: string;
  title: string;
  mainLocation: 'CDU' | 'HOSPITAL' | 'EXTERNO';
  sectors: string[];
  extension: string;
  additionalInfo: string;
  rules?: string;
  category_id: string; // Adicionado para mapear a FK
}

export interface TussCode {
  id: string;
  code: string;
  description: string;
}

export interface ContactItem {
  id: string;
  setor: string;
  local: string;
  ramal: string;
  telefone: string;
  whatsapp: string;
}

export interface DiferenciatedFee {
  id: string;
  profissional: string;
  valor: number;
  genero: 'masculino' | 'feminino';
}

export interface ValueTableItem {
  id: string;
  codigo: string;
  nome: string;
  info: string;
  honorario: number;
  exame_cartao: number;
  material_min: number;
  material_max: number;
  honorarios_diferenciados: DiferenciatedFee[];
  category_id: string; // Adicionado para mapear a FK
}

export interface DetailedExam {
  name: string;
  category: string;
}

export interface ExamDetail {
  examId: string;
  observations: string;
  preparation: string;
  withAnesthesia: boolean;
  anesthesiaInstructions?: string;
}

export interface Professional {
  id: string;
  name: string;
  gender: 'masculino' | 'feminino';
  specialty: string;
  ageRange: string;
  fittings: {
    allowed: boolean;
    max: number;
    details: string;
  };
  generalObs: string;
  performedExams: ExamDetail[];
}

export interface OfficeAttendant {
  id: string;
  name: string;
  username: string;
  shift: string;
}

export interface OfficeProfessional {
  name: string;
  specialty: string;
  actuationDescription?: string;
}

export interface Office {
  id: string;
  name: string;
  ramal: string;
  schedule: string;
  specialties: string[];
  attendants: OfficeAttendant[];
  professionals: OfficeProfessional[];
  procedures: string[];
}

export interface HeaderTagInfo {
  id: string;
  tag: string;
  title: string;
  address?: string;
  phones?: { label: string; number: string }[];
  whatsapp?: string;
  contacts?: { name: string; phone: string; ramal: string }[];
}

export interface ExamDeliveryAttendant {
  id: string;
  name: string;
  chatNick: string;
}

export interface RecadoCategory {
  id: string;
  title: string;
  description: string;
  destinationType: 'attendant' | 'group';
  groupName?: string;
  attendants?: { id: string; name: string; chatNick: string }[];
}

export interface RecadoItem {
  id: string;
  title: string;
  content: string;
  fields: string[];
  category_id: string; // Adicionado para mapear a FK
}

// --- NOVOS TIPOS PARA INFORMAÇÕES/REGRAS ---
export interface InfoTag {
  id: string;
  name: string;
  color: string; // Para estilização
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string; // MIME type
  dataUrl: string; // Base64 content
  size: number; // in bytes
}

export interface InfoItem {
  id: string;
  title: string;
  content: string; // O corpo da regra/procedimento
  tagId: string;
  date: string; // Data de criação/atualização (mantido para exibição, mas Supabase gerencia created_at/updated_at)
  attachments: Attachment[]; // NOVO CAMPO
}