import {
  Category,
  ScriptItem,
  ExamItem,
  ContactItem,
  ValueTableItem,
  Professional,
  DetailedExam,
  Office,
  HeaderTagInfo,
  ExamDeliveryAttendant,
  RecadoCategory,
  RecadoItem,
  InfoTag,
  InfoItem,
} from "@/types/data";
import { Notice } from "@/types/notice";

export const scriptCategories: Record<string, Category[]> = {
  UNIMED: [
    { id: "un-cat-1", name: "CONSULTAS", color: "text-teal-800" },
    { id: "un-cat-2", name: "EXAMES", color: "text-blue-800" },
  ],
  CASSI: [],
  ANESTESIA: [],
  PARTICULAR: [],
};

export const scriptData: Record<string, Record<string, ScriptItem[]>> = {
  UNIMED: {
    "un-cat-1": [
      {
        id: "s-1",
        title: "Consulta Particular",
        content:
          "Olá! A consulta particular tem valor de R$ 200,00.\n\nForma de pagamento:\n- Cartão (débito/crédito)\n- Dinheiro\n- PIX",
      },
    ],
    "un-cat-2": [],
  },
  CASSI: {},
  PARTICULAR: {},
  ANESTESIA: {},
};

export const examCategories: Record<string, Category[]> = {
  CDU: [
    { id: "ex-cat-1", name: "ULTRASSOM", color: "text-green-800" },
    { id: "ex-cat-2", name: "RAIO X", color: "text-red-800" },
    { id: "ex-cat-geral", name: "GERAL", color: "text-primary" },
  ],
  HOSPITAL: [],
  EXTERNO: [],
  EXAMES: [
    { id: "e-cat-1", name: "ULTRASSOM", color: "text-green-800" },
    { id: "e-cat-2", name: "RAIO X", color: "text-red-800" },
    { id: "e-cat-3", name: "ENDOSCOPIA", color: "text-blue-800" },
  ],
};

export const examData: Record<string, Record<string, ExamItem[]>> = {
  CDU: {
    "ex-cat-1": [
      {
        id: "e-1",
        code: "---",
        title: "USG Abdômen Total",
        mainLocation: "CDU",
        sectors: ["1º Andar"],
        extension: "2110",
        additionalInfo: "Necessário jejum de 8 horas.",
      },
    ],
    "ex-cat-geral": [],
    "ex-cat-2": [],
  },
  EXTERNO: {},
  EXAMES: {
    "e-cat-1": [
      {
        id: "ex-1",
        code: "---",
        title: "USG ABDÔMEN TOTAL",
        mainLocation: "CDU",
        sectors: ["1º Andar"],
        extension: "2110",
        additionalInfo: "Necessário jejum de 8 horas.",
      }
    ],
    "e-cat-2": [],
    "e-cat-3": [],
  },
};

export const contactCategories: Record<string, Category[]> = {
  GERAL: [
    { id: "cont-cat-geral", name: "GERAL", color: "text-indigo-800" },
  ],
};

export const contactData: Record<string, Record<string, ContactItem[]>> = {
  GERAL: {
    "cont-cat-geral": [
      {
        id: "c-1",
        setor: "Recepção Principal",
        local: "Térreo",
        ramal: "1000",
        telefone: "(14) 3235-3333",
        whatsapp: "(14) 99999-1111",
      },
    ],
  },
};

export const valueTableCategories: Record<string, Category[]> = {
  GERAL: [
    { id: "vt-cat-geral", name: "GERAL", color: "text-primary" },
  ],
};

export const valueTableData: Record<string, Record<string, ValueTableItem[]>> = {
  GERAL: {
    "vt-cat-geral": [],
  },
};

export const detailedExamData: Record<string, DetailedExam> = {
  "usg-abdomen": {
    name: "USG Abdômen Total",
    category: "ULTRASSOM",
  },
  "raio-x-torax": {
    name: "Raio X de Tórax",
    category: "RAIO X",
  },
  "endoscopia": {
    name: "Endoscopia",
    category: "ENDOSCOPIA",
  },
};

export const professionalData: Record<string, Record<string, Professional[]>> = {
  GERAL: {
    "prof-cat-1": [
      {
        id: "p-1",
        name: "SILVA",
        gender: "masculino",
        specialty: "Gastroenterologia",
        ageRange: "Adultos",
        fittings: {
          allowed: true,
          max: 2,
          details: "Apenas encaixes urgentes.",
        },
        generalObs: "Atende apenas às terças e quintas.",
        performedExams: [
          {
            examId: "endoscopia",
            observations: "Requer sedação leve.",
            preparation: "Jejum de 12h.",
            withAnesthesia: false,
            anesthesiaInstructions: "",
          },
        ],
      },
    ],
  },
};

export const officeData: Office[] = [
  {
    id: "o-1",
    name: "1º Andar",
    ramal: "2110",
    schedule: "08:00 - 18:00",
    specialties: ["Gastroenterologia", "Cardiologia"],
    attendants: [
      { id: "a-1", name: "Ana Paula", username: "Ana", shift: "Integral" },
    ],
    professionals: [
      { name: "DRº. SILVA", specialty: "Gastroenterologia", actuationDescription: "Especialista em Endoscopia" },
    ],
    procedures: ["Endoscopia", "Colonoscopia"],
  },
];

export const noticeData: Notice[] = [
  {
    id: "n-1",
    title: "Novo Fluxo de Autorização",
    content: "A partir de hoje, todas as solicitações de autorização devem ser enviadas via sistema X.",
    date: new Date().toLocaleDateString("pt-BR"),
    tag: "FLUXO", // Adicionando tag
  },
];

export const headerTagData: HeaderTagInfo[] = [
  {
    id: "tag-1",
    tag: "CDU",
    title: "Central de Diagnóstico Unimed",
    address: "Rua X, 123 - Centro",
    phones: [
      { label: "Agendamento", number: "(14) 3235-3333" },
    ],
    whatsapp: "(14) 99999-1111",
    contacts: [],
  },
  {
    id: "tag-2",
    tag: "GERENCIA",
    title: "Contatos da Gerência",
    address: "",
    phones: [],
    whatsapp: "",
    contacts: [
      { name: "João", phone: "(14) 99999-2222", ramal: "100" },
    ],
  },
];

export const examDeliveryAttendants: ExamDeliveryAttendant[] = [
  { id: "eda-1", name: "Maria", chatNick: "Maria_Exames" },
];

export const recadoCategories: RecadoCategory[] = [
  {
    id: "rc-1",
    title: "Autorização",
    description: "Recados para o setor de Autorização de Guias.",
    destinationType: "group",
    groupName: "Grupo Autorização",
  },
];

export const recadoData: Record<string, RecadoItem[]> = {
  "rc-1": [
    {
      id: "ri-1",
      title: "Solicitação de Guia",
      content: "Prezados, solicito a autorização da guia para o paciente [paciente].\n\nGuia: [guia]\n\nObrigado!\n[nome] / Agendamento",
      fields: ["paciente", "guia"],
    },
  ],
};

// --- NOVOS DADOS PARA INFORMAÇÕES/REGRAS ---
export const infoTags: InfoTag[] = [
  { id: "it-1", name: "Regras Gerais", color: "text-teal-800" },
  { id: "it-2", name: "Novos Procedimentos", color: "text-blue-800" },
];

export const infoData: Record<string, InfoItem[]> = {
  "it-1": [
    {
      id: "ii-1",
      title: "Fluxo de Agendamento de USG",
      content: "1. Verificar elegibilidade do paciente.\n2. Confirmar jejum de 8h.\n3. Agendar no sistema X.",
      tagId: "it-1",
      date: new Date().toLocaleDateString("pt-BR"),
      attachments: [],
    },
  ],
  "it-2": [],
};