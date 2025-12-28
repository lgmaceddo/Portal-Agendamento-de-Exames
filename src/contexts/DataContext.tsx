import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";
import {
  Category,
  ScriptItem,
  ExamItem,
  ContactItem,
  ValueTableItem,
  Professional,
  Office,
  HeaderTagInfo,
  ExamDeliveryAttendant,
  RecadoCategory,
  RecadoItem,
  InfoTag,
  InfoItem,
  TussCode,
} from "@/types/data";
import { Notice } from "@/types/notice";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Database } from "@/integrations/supabase/types";

// Mapeamento de tipos de tabela do Supabase
type DbCategory = Database['public']['Tables']['categories']['Row'];
type DbScript = Database['public']['Tables']['scripts']['Row'];
type DbExam = Database['public']['Tables']['exams']['Row'];
type DbContact = Database['public']['Tables']['contacts']['Row'];
type DbValueTable = Database['public']['Tables']['value_tables']['Row'];
type DbProfessional = Database['public']['Tables']['professionals']['Row'];
type DbOffice = Database['public']['Tables']['offices']['Row'];
type DbNotice = Database['public']['Tables']['notices']['Row'];
type DbHeaderTag = Database['public']['Tables']['header_tags']['Row'];
type DbExamDeliveryAttendant = Database['public']['Tables']['exam_delivery_attendants']['Row'];
type DbRecadoCategory = Database['public']['Tables']['recado_categories']['Row'];
type DbRecado = Database['public']['Tables']['recados']['Row'];
type DbInfoTag = Database['public']['Tables']['info_tags']['Row'];
type DbInfo = Database['public']['Tables']['infos']['Row'];

// --- Mapeamento de Dados do Banco para o Frontend ---

const mapDbCategoryToFE = (dbCat: DbCategory): Category => ({
  id: dbCat.id,
  name: dbCat.name,
  color: dbCat.color,
  view_type: dbCat.view_type,
});

const mapDbScriptToFE = (dbScript: DbScript): ScriptItem => ({
  id: dbScript.id,
  title: dbScript.title,
  content: dbScript.content,
  order: dbScript.order || undefined,
  category_id: dbScript.category_id,
});

const mapDbExamToFE = (dbExam: DbExam): ExamItem => ({
  id: dbExam.id,
  code: dbExam.category_id, // Código não mapeado diretamente, usando category_id como fallback
  title: dbExam.title,
  mainLocation: dbExam.location[0] as 'CDU' | 'HOSPITAL' | 'EXTERNO',
  sectors: dbExam.location,
  extension: dbExam.extension,
  additionalInfo: dbExam.additional_info || '',
  rules: (dbExam.scheduling_rules as any)?.rules || '',
  category_id: dbExam.category_id,
});

const mapDbContactToFE = (dbContact: DbContact): ContactItem => ({
  id: dbContact.id,
  setor: dbContact.setor,
  local: dbContact.local || '',
  ramal: dbContact.ramal || '',
  telefone: dbContact.telefone || '',
  whatsapp: dbContact.whatsapp || '',
});

const mapDbValueTableToFE = (dbValue: DbValueTable): ValueTableItem => ({
  id: dbValue.id,
  codigo: dbValue.codigo || '',
  nome: dbValue.nome,
  info: dbValue.info || '',
  honorario: dbValue.honorario || 0,
  exame_cartao: dbValue.exame_cartao || 0,
  material_min: dbValue.material_min || 0,
  material_max: dbValue.material_max || 0,
  honorarios_diferenciados: (dbValue.honorarios_diferenciados as any) || [],
  category_id: dbValue.category_id,
});

const mapDbProfessionalToFE = (dbProf: DbProfessional): Professional => ({
  id: dbProf.id,
  name: dbProf.name,
  gender: dbProf.gender as 'masculino' | 'feminino',
  specialty: dbProf.specialty,
  ageRange: dbProf.age_range || '',
  fittings: (dbProf.fittings as any) || { allowed: false, max: 0, details: '' },
  generalObs: dbProf.general_obs || '',
  performedExams: (dbProf.performed_exams as any) || [],
});

const mapDbOfficeToFE = (dbOffice: DbOffice): Office => ({
  id: dbOffice.id,
  name: dbOffice.name,
  ramal: dbOffice.ramal,
  schedule: dbOffice.schedule,
  specialties: dbOffice.specialties || [],
  attendants: (dbOffice.attendants as any) || [],
  professionals: (dbOffice.professionals as any) || [],
  procedures: dbOffice.procedures || [],
});

const mapDbNoticeToFE = (dbNotice: DbNotice): Notice => ({
  id: dbNotice.id,
  title: dbNotice.title,
  content: dbNotice.content,
  date: dbNotice.date,
  tag: dbNotice.tag as any,
});

const mapDbHeaderTagToFE = (dbTag: DbHeaderTag): HeaderTagInfo => ({
  id: dbTag.id,
  tag: dbTag.tag,
  title: dbTag.title,
  address: dbTag.address || '',
  phones: (dbTag.phones as any) || [],
  whatsapp: dbTag.whatsapp || '',
  contacts: (dbTag.contacts as any) || [],
});

const mapDbExamDeliveryAttendantToFE = (dbAttendant: DbExamDeliveryAttendant): ExamDeliveryAttendant => ({
  id: dbAttendant.id,
  name: dbAttendant.name,
  chatNick: dbAttendant.chat_nick,
});

const mapDbRecadoCategoryToFE = (dbCat: DbRecadoCategory): RecadoCategory => ({
  id: dbCat.id,
  title: dbCat.title,
  description: dbCat.description,
  destinationType: dbCat.destination_type as 'attendant' | 'group',
  groupName: dbCat.group_name || '',
  attendants: (dbCat.attendants as any) || [],
});

const mapDbRecadoItemToFE = (dbRecado: DbRecado): RecadoItem => ({
  id: dbRecado.id,
  title: dbRecado.title,
  content: dbRecado.content || '',
  fields: (dbRecado.fields as any) || [],
  category_id: dbRecado.category_id,
});

const mapDbInfoTagToFE = (dbTag: DbInfoTag): InfoTag => ({
  id: dbTag.id,
  name: dbTag.name,
  color: dbTag.color,
});

const mapDbInfoItemToFE = (dbInfo: DbInfo): InfoItem => ({
  id: dbInfo.id,
  title: dbInfo.title,
  content: dbInfo.content || '',
  tagId: dbInfo.tag_id,
  date: dbInfo.date || new Date(dbInfo.created_at).toLocaleDateString("pt-BR"),
  attachments: (dbInfo.attachments as any) || [],
});


// --- Tipos de Contexto ---

interface DataContextType {
  loading: boolean;
  error: string | null;
  scriptCategories: Record<string, Category[]>;
  scriptData: Record<string, Record<string, ScriptItem[]>>;
  examCategories: Record<string, Category[]>;
  examData: Record<string, Record<string, ExamItem[]>>;
  contactCategories: Record<string, Category[]>;
  contactData: Record<string, Record<string, ContactItem[]>>;
  valueTableCategories: Record<string, Category[]>;
  valueTableData: Record<string, Record<string, ValueTableItem[]>>;
  professionalData: Record<string, Record<string, Professional[]>>;
  officeData: Office[];
  noticeData: Notice[];
  headerTagData: HeaderTagInfo[];
  examDeliveryAttendants: ExamDeliveryAttendant[];
  recadoCategories: RecadoCategory[];
  recadoData: Record<string, RecadoItem[]>;
  infoTags: InfoTag[];
  infoData: Record<string, InfoItem[]>;
  tussCodes: TussCode[];
  userName: string;
  hasUnsavedChanges: boolean; // Mantido para localStorage (TUSS, UserName)

  // User functions
  setUserName: (name: string) => void;

  // Save/Load functions (Apenas para dados locais)
  saveToLocalStorage: () => void;
  exportAllData: () => string;
  importAllData: (jsonData: string) => Promise<boolean>; // Tornando assíncrona

  // CRUD Functions (Supabase)
  updateHeaderTag: (id: string, updates: Omit<HeaderTagInfo, "id" | "tag">) => Promise<void>;
  addNotice: (notice: Omit<Notice, "id">) => Promise<void>;
  updateNotice: (notice: Notice) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  addOffice: (office: Omit<Office, "id">) => Promise<void>;
  updateOffice: (office: Office) => Promise<void>;
  deleteOffice: (id: string) => Promise<void>;
  addExamDeliveryAttendant: (attendant: Omit<ExamDeliveryAttendant, "id">) => Promise<void>;
  updateExamDeliveryAttendant: (attendant: ExamDeliveryAttendant) => Promise<void>;
  deleteExamDeliveryAttendant: (id: string) => Promise<void>;
  addProfessional: (viewType: string, categoryId: string, professional: Omit<Professional, "id">) => Promise<void>;
  updateProfessional: (viewType: string, categoryId: string, professionalId: string, updates: Partial<Omit<Professional, "id">>) => Promise<void>;
  deleteProfessional: (viewType: string, categoryId: string, professionalId: string) => Promise<void>;
  addScriptCategory: (viewType: string, category: Omit<Category, "id">) => Promise<void>;
  updateScriptCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteScriptCategory: (viewType: string, categoryId: string) => Promise<void>;
  addScript: (viewType: string, categoryId: string, script: Omit<ScriptItem, "id" | "category_id">) => Promise<void>;
  updateScript: (viewType: string, categoryId: string, scriptId: string, updates: Partial<ScriptItem>) => Promise<void>;
  deleteScript: (viewType: string, categoryId: string, scriptId: string) => Promise<void>;
  addExamCategory: (viewType: string, category: Omit<Category, "id">) => Promise<void>;
  updateExamCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteExamCategory: (viewType: string, categoryId: string) => Promise<void>;
  addExam: (viewType: string, categoryId: string, exam: Omit<ExamItem, "id" | "category_id">) => Promise<void>;
  updateExam: (viewType: string, categoryId: string, examId: string, updates: Partial<ExamItem>) => Promise<void>;
  deleteExam: (viewType: string, categoryId: string, examId: string) => Promise<void>;
  addContactCategory: (viewType: string, category: Omit<Category, "id">) => Promise<void>;
  updateContactCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteContactCategory: (viewType: string, categoryId: string) => Promise<void>;
  addContact: (viewType: string, categoryId: string, contact: Omit<ContactItem, "id">) => Promise<void>;
  updateContact: (viewType: string, categoryId: string, contactId: string, updates: Partial<ContactItem>) => Promise<void>;
  deleteContact: (viewType: string, categoryId: string, contactId: string) => Promise<void>;
  addValueTableCategory: (viewType: string, category: Omit<Category, "id">) => Promise<void>;
  updateValueTableCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteValueTableCategory: (viewType: string, categoryId: string) => Promise<void>;
  addValueTable: (viewType: string, categoryId: string, item: Omit<ValueTableItem, "id" | "category_id">) => Promise<void>;
  updateValueTable: (viewType: string, categoryId: string, itemId: string, updates: Partial<Omit<ValueTableItem, "id">>) => Promise<void>;
  deleteValueTable: (viewType: string, categoryId: string, itemId: string) => Promise<void>;
  setValueTableCategoryItems: (viewType: string, categoryId: string, items: ValueTableItem[]) => Promise<void>;
  addRecadoCategory: (category: Omit<RecadoCategory, "id">) => Promise<void>;
  updateRecadoCategory: (category: RecadoCategory) => Promise<void>;
  deleteRecadoCategory: (categoryId: string) => Promise<void>;
  addRecadoItem: (categoryId: string, item: Omit<RecadoItem, "id" | "category_id">) => Promise<void>;
  updateRecadoItem: (categoryId: string, itemId: string, updates: Partial<RecadoItem>) => Promise<void>;
  deleteRecadoItem: (categoryId: string, itemId: string) => Promise<void>;
  addInfoTag: (tag: Omit<InfoTag, "id">) => Promise<void>;
  updateInfoTag: (tag: InfoTag) => Promise<void>;
  deleteInfoTag: (tagId: string) => Promise<void>;
  addInfoItem: (item: Omit<InfoItem, "id" | "date" | "tagId"> & { tagId: string }) => Promise<void>;
  updateInfoItem: (item: InfoItem) => Promise<void>;
  deleteInfoItem: (itemId: string, tagId: string) => Promise<void>;
  syncExamsFromValueTable: () => Promise<void>;
  importTussCodes: (codes: TussCode[]) => void;
  clearTussCodes: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Funções de Mapeamento de Estrutura (Agrupamento) ---

const groupItemsByViewAndCategory = <T extends { category_id: string }>(
  items: T[],
  categories: DbCategory[],
  viewTypes: string[]
): Record<string, Record<string, T[]>> => {
  const grouped: Record<string, Record<string, T[]>> = {};
  const categoryMap = new Map(categories.map(c => [c.id, c.view_type]));

  viewTypes.forEach(view => {
    grouped[view] = {};
  });

  items.forEach(item => {
    const view = categoryMap.get(item.category_id) || 'UNKNOWN';
    if (viewTypes.includes(view)) {
      if (!grouped[view][item.category_id]) {
        grouped[view][item.category_id] = [];
      }
      grouped[view][item.category_id].push(item);
    }
  });

  return grouped;
};

const groupCategoriesByView = (categories: DbCategory[], viewTypes: string[]): Record<string, Category[]> => {
  const grouped: Record<string, Category[]> = {};
  viewTypes.forEach(view => {
    grouped[view] = categories
      .filter(c => c.view_type === view)
      .map(mapDbCategoryToFE)
      .sort((a, b) => a.name.localeCompare(b.name));
  });
  return grouped;
};

const groupRecadoItemsByCategory = (items: DbRecado[]): Record<string, RecadoItem[]> => {
  const grouped: Record<string, RecadoItem[]> = {};
  items.forEach(item => {
    if (!grouped[item.category_id]) {
      grouped[item.category_id] = [];
    }
    grouped[item.category_id].push(mapDbRecadoItemToFE(item));
  });
  return grouped;
};

const groupInfoItemsByTag = (items: DbInfo[]): Record<string, InfoItem[]> => {
  const grouped: Record<string, InfoItem[]> = {};
  items.forEach(item => {
    if (!grouped[item.tag_id]) {
      grouped[item.tag_id] = [];
    }
    grouped[item.tag_id].push(mapDbInfoItemToFE(item));
  });
  return grouped;
};

// --- DataProvider Component ---

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const {
    loading: supabaseLoading,
    error: supabaseError,
    categories: dbCategories,
    scripts: dbScripts,
    exams: dbExams,
    contacts: dbContacts,
    valueTables: dbValueTables,
    professionals: dbProfessionals,
    offices: dbOffices,
    notices: dbNotices,
    headerTags: dbHeaderTags,
    examDeliveryAttendants: dbExamDeliveryAttendants,
    recadoCategories: dbRecadoCategories,
    recadoItems: dbRecadoItems,
    infoTags: dbInfoTags,
    infoItems: dbInfoItems,
    createItem,
    updateItem,
    deleteItem,
    refetchAll,
  } = useSupabaseData();

  // --- Local State (TUSS, UserName, Unsaved Changes) ---
  const [tussCodes, setTussCodes] = useState<TussCode[]>(() => {
    try {
      const saved = localStorage.getItem('portalTussCodes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [userName, setUserNameState] = useState<string>(() => {
    const saved = localStorage.getItem('portalUserName');
    return saved || '';
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- Funções de Gerenciamento de Dados Locais (TUSS) ---
  
  const importTussCodes = useCallback((codes: TussCode[]) => {
    setTussCodes(codes);
    setHasUnsavedChanges(true);
  }, []);

  const clearTussCodes = useCallback(() => {
    setTussCodes([]);
    setHasUnsavedChanges(true);
  }, []);

  // --- Mapeamento de Dados para o Frontend ---
  const viewTypes = useMemo(() => ["UNIMED", "CASSI", "PARTICULAR", "ANESTESIA", "CDU", "HOSPITAL", "EXTERNO", "GERAL", "EXAMES"], []);

  const scriptCategories = useMemo(() => groupCategoriesByView(dbCategories, viewTypes), [dbCategories, viewTypes]);
  const scriptData = useMemo(() => groupItemsByViewAndCategory(dbScripts.map(mapDbScriptToFE), dbCategories, viewTypes), [dbScripts, dbCategories, viewTypes]);

  const examCategories = useMemo(() => groupCategoriesByView(dbCategories, viewTypes), [dbCategories, viewTypes]);
  const examData = useMemo(() => groupItemsByViewAndCategory(dbExams.map(mapDbExamToFE), dbCategories, viewTypes), [dbExams, dbCategories, viewTypes]);

  const contactCategories = useMemo(() => groupCategoriesByView(dbCategories, ["GERAL"]), [dbCategories]);
  const contactData = useMemo(() => groupItemsByViewAndCategory(dbContacts.map(mapDbContactToFE), dbCategories, ["GERAL"]), [dbContacts, dbCategories]);

  const valueTableCategories = useMemo(() => groupCategoriesByView(dbCategories, ["GERAL"]), [dbCategories]);
  const valueTableData = useMemo(() => groupItemsByViewAndCategory(dbValueTables.map(mapDbValueTableToFE), dbCategories, ["GERAL"]), [dbValueTables, dbCategories]);

  const professionalData = useMemo(() => {
    const mapped = dbProfessionals.map(mapDbProfessionalToFE);
    return { GERAL: { 'prof-cat-1': mapped } }; // Mantendo a estrutura aninhada por compatibilidade
  }, [dbProfessionals]);

  const officeData = useMemo(() => dbOffices.map(mapDbOfficeToFE).sort((a, b) => a.name.localeCompare(b.name)), [dbOffices]);
  const noticeData = useMemo(() => dbNotices.map(mapDbNoticeToFE).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [dbNotices]);
  const headerTagData = useMemo(() => dbHeaderTags.map(mapDbHeaderTagToFE), [dbHeaderTags]);
  const examDeliveryAttendants = useMemo(() => dbExamDeliveryAttendants.map(mapDbExamDeliveryAttendantToFE).sort((a, b) => a.name.localeCompare(b.name)), [dbExamDeliveryAttendants]);
  const recadoCategories = useMemo(() => dbRecadoCategories.map(mapDbRecadoCategoryToFE).sort((a, b) => a.title.localeCompare(b.title)), [dbRecadoCategories]);
  const recadoData = useMemo(() => groupRecadoItemsByCategory(dbRecadoItems), [dbRecadoItems]);
  const infoTags = useMemo(() => dbInfoTags.map(mapDbInfoTagToFE).sort((a, b) => a.name.localeCompare(b.name)), [dbInfoTags]);
  const infoData = useMemo(() => groupInfoItemsByTag(dbInfoItems), [dbInfoItems]);

  // --- Funções de Sincronização e LocalStorage ---

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('portalUserName', name);
  };

  const saveToLocalStorage = () => {
    // Apenas salva dados locais (TUSS, UserName)
    localStorage.setItem('portalTussCodes', JSON.stringify(tussCodes));
    localStorage.setItem('portalUserName', userName);
    setHasUnsavedChanges(false);
    toast.success("Dados locais (TUSS, Nome) salvos com sucesso!");
  };

  const exportAllData = (): string => {
    // Exporta dados do Supabase (que estão em memória) + dados locais
    const allData = {
      scriptCategories: scriptCategories,
      scriptData: scriptData,
      examCategories: examCategories,
      examData: examData,
      contactCategories: contactCategories,
      contactData: contactData,
      valueTableCategories: valueTableCategories,
      valueTableData: valueTableData,
      professionalData: professionalData,
      officeData: officeData,
      noticeData: noticeData,
      headerTagData: headerTagData,
      examDeliveryAttendants: examDeliveryAttendants,
      recadoCategories: recadoCategories,
      recadoData: recadoData,
      infoTags: infoTags,
      infoData: infoData,
      tussCodes: tussCodes, // Inclui TUSS codes
      userName: userName, // Inclui nome de usuário
      exportDate: new Date().toISOString(),
      version: "2.0"
    };
    return JSON.stringify(allData, null, 2);
  };

  const importAllData = useCallback(async (jsonData: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonData);

      if (!data || typeof data !== 'object' || data.version !== "2.0") {
        toast.error("Arquivo de backup inválido ou versão incompatível.");
        return false;
      }

      // 1. Importar dados locais (TUSS, UserName)
      if (data.tussCodes) setTussCodes(data.tussCodes);
      if (data.userName) setUserName(data.userName);
      
      localStorage.setItem('portalTussCodes', JSON.stringify(data.tussCodes || []));
      localStorage.setItem('portalUserName', data.userName || '');

      toast.info("Iniciando importação de dados do Supabase. Isso pode levar alguns segundos...");

      // 2. Mapeamento de tabelas e dados de importação
      const importMap: { table: keyof Database['public']['Tables'], dataKey: keyof typeof data, mapFn: (item: any) => any }[] = [
        { table: 'categories', dataKey: 'scriptCategories', mapFn: (item) => ({ id: item.id, name: item.name, color: item.color, view_type: item.view_type }) },
        { table: 'scripts', dataKey: 'scriptData', mapFn: (item) => ({ id: item.id, title: item.title, content: item.content, order: item.order, category_id: item.category_id }) },
        { table: 'exams', dataKey: 'examData', mapFn: (item) => ({ id: item.id, title: item.title, location: item.sectors, extension: item.extension, additional_info: item.additionalInfo, scheduling_rules: { rules: item.rules || '' }, category_id: item.category_id, view_type: item.mainLocation }) },
        { table: 'contacts', dataKey: 'contactData', mapFn: (item) => ({ id: item.id, setor: item.setor, local: item.local, ramal: item.ramal, telefone: item.telefone, whatsapp: item.whatsapp }) },
        { table: 'value_tables', dataKey: 'valueTableData', mapFn: (item) => ({ id: item.id, codigo: item.codigo, nome: item.nome, info: item.info, honorario: item.honorario, exame_cartao: item.exame_cartao, material_min: item.material_min, material_max: item.material_max, honorarios_diferenciados: item.honorarios_diferenciados, category_id: item.category_id }) },
        { table: 'professionals', dataKey: 'professionalData', mapFn: (item) => ({ id: item.id, name: item.name, gender: item.gender, specialty: item.specialty, age_range: item.ageRange, fittings: item.fittings, general_obs: item.generalObs, performed_exams: item.performedExams }) },
        { table: 'offices', dataKey: 'officeData', mapFn: (item) => ({ id: item.id, name: item.name, ramal: item.ramal, schedule: item.schedule, specialties: item.specialties, attendants: item.attendants, professionals: item.professionals, procedures: item.procedures }) },
        { table: 'notices', dataKey: 'noticeData', mapFn: (item) => ({ id: item.id, title: item.title, content: item.content, date: item.date, tag: item.tag }) },
        { table: 'header_tags', dataKey: 'headerTagData', mapFn: (item) => ({ id: item.id, tag: item.tag, title: item.title, address: item.address, phones: item.phones, whatsapp: item.whatsapp, contacts: item.contacts }) },
        { table: 'exam_delivery_attendants', dataKey: 'examDeliveryAttendants', mapFn: (item) => ({ id: item.id, name: item.name, chat_nick: item.chatNick }) },
        { table: 'recado_categories', dataKey: 'recadoCategories', mapFn: (item) => ({ id: item.id, title: item.title, description: item.description, destination_type: item.destinationType, group_name: item.groupName, attendants: item.attendants }) },
        { table: 'recados', dataKey: 'recadoData', mapFn: (item) => ({ id: item.id, title: item.title, content: item.content, fields: item.fields, category_id: item.category_id }) },
        { table: 'info_tags', dataKey: 'infoTags', mapFn: (item) => ({ id: item.id, name: item.name, color: item.color }) },
        { table: 'infos', dataKey: 'infoData', mapFn: (item) => ({ id: item.id, title: item.title, content: item.content, tag_id: item.tagId, date: item.date, attachments: item.attachments }) },
      ];

      let totalImported = 0;

      for (const { table, dataKey, mapFn } of importMap) {
        let itemsToImport: any[] = [];
        const rawData = data[dataKey];

        if (rawData) {
          if (Array.isArray(rawData)) {
            // Para arrays simples (offices, notices, tags, attendants)
            itemsToImport = rawData.map(mapFn);
          } else if (typeof rawData === 'object' && rawData !== null) {
            // Para objetos aninhados (scripts, exams, contacts, values, professionals, recados, infos)
            Object.values(rawData).forEach((viewData: any) => {
              if (typeof viewData === 'object' && viewData !== null) {
                Object.values(viewData).forEach((categoryItems: any) => {
                  if (Array.isArray(categoryItems)) {
                    itemsToImport.push(...categoryItems.map(mapFn));
                  }
                });
              }
            });
          }
        }

        if (itemsToImport.length > 0) {
          // Usar upsert (onConflict: 'id') para atualizar ou inserir
          const { error } = await supabase
            .from(table)
            .upsert(itemsToImport, { onConflict: 'id', ignoreDuplicates: false });

          if (error) {
            console.error(`Erro ao importar dados para ${table}:`, error);
            toast.error(`Erro ao importar ${table}: ${error.message}`);
            // Continua para a próxima tabela, mas registra o erro
          } else {
            totalImported += itemsToImport.length;
          }
        }
      }

      await refetchAll();
      toast.success(`Importação concluída! ${totalImported} itens de conteúdo atualizados/inseridos.`);
      return true;
    } catch (error) {
      console.error("Erro fatal ao processar o arquivo de importação:", error);
      toast.error("Erro fatal ao processar o arquivo de importação.");
      return false;
    }
  }, [refetchAll, setUserName, createItem, updateItem, deleteItem, importTussCodes, clearTussCodes]);


  // --- Funções CRUD (Supabase) ---
  
  const addCategory = useCallback(async (table: 'categories' | 'info_tags' | 'recado_categories', viewType: string, category: Omit<Category, "id">) => {
    // Usando string literal para o nome da tabela para evitar problemas de cache de tipagem
    const tableName = table === 'categories' ? 'categories' : table === 'info_tags' ? 'info_tags' : 'recado_categories';
    
    const newCategory = await createItem(tableName, { ...category, view_type: viewType });
    return newCategory;
  }, [createItem]);

  const updateCategory = useCallback(async (table: 'categories' | 'info_tags' | 'recado_categories', categoryId: string, updates: Partial<Category>) => {
    const tableName = table === 'categories' ? 'categories' : table === 'info_tags' ? 'info_tags' : 'recado_categories';
    const { view_type, ...rest } = updates;
    await updateItem(tableName, categoryId, rest);
  }, [updateItem]);

  const deleteCategory = useCallback(async (table: 'categories' | 'info_tags' | 'recado_categories', categoryId: string) => {
    const tableName = table === 'categories' ? 'categories' : table === 'info_tags' ? 'info_tags' : 'recado_categories';
    await deleteItem(tableName, categoryId);
  }, [deleteItem]);

  const addScript = useCallback(async (viewType: string, categoryId: string, script: Omit<ScriptItem, "id" | "category_id">) => {
    await createItem('scripts', { ...script, category_id: categoryId, view_type: viewType });
  }, [createItem]);

  const updateScript = useCallback(async (viewType: string, categoryId: string, scriptId: string, updates: Partial<ScriptItem>) => {
    await updateItem('scripts', scriptId, { ...updates, category_id: categoryId, view_type: viewType });
  }, [updateItem]);

  const deleteScript = useCallback(async (viewType: string, categoryId: string, scriptId: string) => {
    await deleteItem('scripts', scriptId);
  }, [deleteItem]);

  const addExam = useCallback(async (viewType: string, categoryId: string, exam: Omit<ExamItem, "id" | "category_id">) => {
    await createItem('exams', {
      title: exam.title,
      location: exam.sectors,
      extension: exam.extension,
      additional_info: exam.additionalInfo,
      scheduling_rules: { rules: exam.rules || '' },
      category_id: categoryId,
      view_type: viewType,
    });
  }, [createItem]);

  const updateExam = useCallback(async (viewType: string, categoryId: string, examId: string, updates: Partial<ExamItem>) => {
    await updateItem('exams', examId, {
      title: updates.title,
      location: updates.sectors,
      extension: updates.extension,
      additional_info: updates.additionalInfo,
      scheduling_rules: { rules: updates.rules || '' },
      category_id: categoryId,
      view_type: viewType,
    });
  }, [updateItem]);

  const deleteExam = useCallback(async (viewType: string, categoryId: string, examId: string) => {
    await deleteItem('exams', examId);
  }, [deleteItem]);

  const addContact = useCallback(async (viewType: string, categoryId: string, contact: Omit<ContactItem, "id">) => {
    await createItem('contacts', { ...contact, category_id: categoryId, view_type: viewType });
  }, [createItem]);

  const updateContact = useCallback(async (viewType: string, categoryId: string, contactId: string, updates: Partial<ContactItem>) => {
    await updateItem('contacts', contactId, { ...updates, category_id: categoryId, view_type: viewType });
  }, [updateItem]);

  const deleteContact = useCallback(async (viewType: string, categoryId: string, contactId: string) => {
    await deleteItem('contacts', contactId);
  }, [deleteItem]);

  const addValueTable = useCallback(async (viewType: string, categoryId: string, item: Omit<ValueTableItem, "id" | "category_id">) => {
    await createItem('value_tables', { ...item, category_id: categoryId, view_type: viewType });
  }, [createItem]);

  const updateValueTable = useCallback(async (viewType: string, categoryId: string, itemId: string, updates: Partial<Omit<ValueTableItem, "id">>) => {
    await updateItem('value_tables', itemId, { ...updates, category_id: categoryId, view_type: viewType });
  }, [updateItem]);

  const deleteValueTable = useCallback(async (viewType: string, categoryId: string, itemId: string) => {
    await deleteItem('value_tables', itemId);
  }, [deleteItem]);

  const setValueTableCategoryItems = useCallback(async (viewType: string, categoryId: string, items: ValueTableItem[]) => {
    // 1. Deleta todos os itens existentes na categoria
    const { error: deleteError } = await supabase
      .from('value_tables')
      .delete()
      .eq('category_id', categoryId);

    if (deleteError) {
      toast.error(`Erro ao limpar a tabela de valores: ${deleteError.message}`);
      throw new Error(deleteError.message);
    }

    // 2. Insere os novos itens (usando upsert para garantir IDs)
    const itemsToInsert = items.map(item => ({
      ...item,
      category_id: categoryId,
      view_type: viewType,
    }));

    const { error: insertError } = await supabase
      .from('value_tables')
      .upsert(itemsToInsert, { onConflict: 'id', ignoreDuplicates: false });

    if (insertError) {
      toast.error(`Erro ao inserir novos itens na tabela de valores: ${insertError.message}`);
      throw new Error(insertError.message);
    }

    await refetchAll();
  }, [refetchAll]);

  const addRecadoCategory = useCallback(async (category: Omit<RecadoCategory, "id">) => {
    await createItem('recado_categories', { ...category, destination_type: category.destinationType, group_name: category.groupName, attendants: category.attendants });
  }, [createItem]);

  const updateRecadoCategory = useCallback(async (category: RecadoCategory) => {
    await updateItem('recado_categories', category.id, { title: category.title, description: category.description, destination_type: category.destinationType, group_name: category.groupName, attendants: category.attendants });
  }, [updateItem]);

  const deleteRecadoCategory = useCallback(async (categoryId: string) => {
    await deleteItem('recado_categories', categoryId);
  }, [deleteItem]);

  const addRecadoItem = useCallback(async (categoryId: string, item: Omit<RecadoItem, "id" | "category_id">) => {
    await createItem('recados', { ...item, category_id: categoryId });
  }, [createItem]);

  const updateRecadoItem = useCallback(async (categoryId: string, itemId: string, updates: Partial<RecadoItem>) => {
    await updateItem('recados', itemId, { ...updates, category_id: categoryId });
  }, [updateItem]);

  const deleteRecadoItem = useCallback(async (categoryId: string, itemId: string) => {
    await deleteItem('recados', itemId);
  }, [deleteItem]);

  const addInfoTag = useCallback(async (tag: Omit<InfoTag, "id">) => {
    await createItem('info_tags', tag);
  }, [createItem]);

  const updateInfoTag = useCallback(async (tag: InfoTag) => {
    await updateItem('info_tags', tag.id, tag);
  }, [updateItem]);

  const deleteInfoTag = useCallback(async (tagId: string) => {
    await deleteItem('info_tags', tagId);
  }, [deleteItem]);

  const addInfoItem = useCallback(async (item: Omit<InfoItem, "id" | "date" | "tagId"> & { tagId: string }) => {
    await createItem('infos', { ...item, tag_id: item.tagId });
  }, [createItem]);

  const updateInfoItem = useCallback(async (item: InfoItem) => {
    await updateItem('infos', item.id, { title: item.title, content: item.content, tag_id: item.tagId, attachments: item.attachments });
  }, [updateItem]);

  const deleteInfoItem = useCallback(async (itemId: string, tagId: string) => {
    await deleteItem('infos', itemId);
  }, [deleteItem]);

  const updateHeaderTag = useCallback(async (id: string, updates: Omit<HeaderTagInfo, "id" | "tag">) => {
    await updateItem('header_tags', id, updates);
  }, [updateItem]);

  const addNotice = useCallback(async (notice: Omit<Notice, "id">) => {
    await createItem('notices', notice);
  }, [createItem]);

  const updateNotice = useCallback(async (notice: Notice) => {
    await updateItem('notices', notice.id, notice);
  }, [updateItem]);

  const deleteNotice = useCallback(async (id: string) => {
    await deleteItem('notices', id);
  }, [deleteItem]);

  const addOffice = useCallback(async (office: Omit<Office, "id">) => {
    await createItem('offices', office);
  }, [createItem]);

  const updateOffice = useCallback(async (office: Office) => {
    await updateItem('offices', office.id, office);
  }, [updateItem]);

  const deleteOffice = useCallback(async (id: string) => {
    await deleteItem('offices', id);
  }, [deleteItem]);

  const addExamDeliveryAttendant = useCallback(async (attendant: Omit<ExamDeliveryAttendant, "id">) => {
    await createItem('exam_delivery_attendants', attendant);
  }, [createItem]);

  const updateExamDeliveryAttendant = useCallback(async (attendant: ExamDeliveryAttendant) => {
    await updateItem('exam_delivery_attendants', attendant.id, attendant);
  }, [updateItem]);

  const deleteExamDeliveryAttendant = useCallback(async (id: string) => {
    await deleteItem('exam_delivery_attendants', id);
  }, [deleteItem]);

  const addProfessional = useCallback(async (viewType: string, categoryId: string, professional: Omit<Professional, "id">) => {
    await createItem('professionals', professional);
  }, [createItem]);

  const updateProfessional = useCallback(async (viewType: string, categoryId: string, professionalId: string, updates: Partial<Omit<Professional, "id">>) => {
    await updateItem('professionals', professionalId, updates);
  }, [updateItem]);

  const deleteProfessional = useCallback(async (viewType: string, categoryId: string, professionalId: string) => {
    await deleteItem('professionals', professionalId);
  }, [deleteItem]);

  const syncExamsFromValueTable = useCallback(async () => {
    // Lógica de sincronização (mantida como estava)
    const valueItems = Object.values(valueTableData).flat().flat();
    const examItems = Object.values(examData).flat().flat();
    const examCategoriesList = Object.values(examCategories).flat();

    if (valueItems.length === 0) {
      toast.info("Nenhum item na Tabela de Valores para sincronizar.");
      return;
    }

    // 1. Cria/garante a categoria 'VALORES' em EXAMES
    const EXAMES_VIEW_TYPE = 'EXAMES';
    const VALORES_CATEGORY_NAME = 'VALORES';
    let valoresCategory = examCategoriesList.find(c => c.name === VALORES_CATEGORY_NAME);

    if (!valoresCategory) {
      const newCat = await addCategory('categories', EXAMES_VIEW_TYPE, { name: VALORES_CATEGORY_NAME, color: 'text-orange-800' });
      valoresCategory = newCat;
    }

    if (!valoresCategory) {
      toast.error("Falha ao criar categoria de sincronização.");
      return;
    }

    const valoresCategoryId = valoresCategory.id;

    // 2. Mapeia exames existentes por código para evitar duplicatas
    const existingExamsMap = new Map<string, ExamItem>();
    examItems.forEach(exam => {
      if (exam.code) {
        existingExamsMap.set(exam.code, exam);
      }
    });

    const updates: { id: string, data: Partial<ExamItem> }[] = [];
    const newExams: Omit<ExamItem, "id" | "category_id">[] = [];

    valueItems.forEach(valueItem => {
      const existingExam = existingExamsMap.get(valueItem.codigo);
      const newExamData: Omit<ExamItem, "id" | "category_id"> = {
        code: valueItem.codigo,
        title: valueItem.nome,
        mainLocation: 'CDU', // Padrão
        sectors: ['1º Andar'], // Padrão
        extension: '2110', // Padrão
        additionalInfo: valueItem.info || '',
        rules: '', // Regras não são sincronizadas da tabela de valores
      };

      if (existingExam && existingExam.category_id === valoresCategoryId) {
        // Atualiza o exame existente
        updates.push({
          id: existingExam.id,
          data: {
            ...newExamData,
            category_id: valoresCategoryId,
            mainLocation: existingExam.mainLocation, // Preserva o local se já existir
            sectors: existingExam.sectors, // Preserva os setores
            extension: existingExam.extension, // Preserva o ramal
          }
        });
      } else if (!existingExam) {
        // Cria novo exame
        newExams.push({ ...newExamData, category_id: valoresCategoryId });
      }
    });

    // 3. Executa as operações de CRUD
    const updatePromises = updates.map(u => updateExam(EXAMES_VIEW_TYPE, valoresCategoryId, u.id, u.data));
    const createPromises = newExams.map(n => addExam(EXAMES_VIEW_TYPE, valoresCategoryId, n));

    await Promise.all([...updatePromises, ...createPromises]);

    toast.success(`Sincronização concluída: ${newExams.length} novos exames adicionados, ${updates.length} atualizados.`);
  }, [valueTableData, examData, examCategories, addCategory, updateExam, addExam, toast]);


  // --- Context Value ---

  const contextValue = useMemo(() => ({
    loading: supabaseLoading,
    error: supabaseError,
    scriptCategories,
    scriptData,
    examCategories,
    examData,
    contactCategories,
    contactData,
    valueTableCategories,
    valueTableData,
    professionalData,
    officeData,
    noticeData,
    headerTagData,
    examDeliveryAttendants,
    recadoCategories,
    recadoData,
    infoTags,
    infoData,
    tussCodes,
    userName,
    hasUnsavedChanges,
    setUserName,
    saveToLocalStorage,
    exportAllData,
    importAllData,
    importTussCodes,
    clearTussCodes,

    // Mapeamento de funções CRUD para Supabase
    updateHeaderTag,
    addNotice, updateNotice, deleteNotice,
    addOffice, updateOffice, deleteOffice,
    addExamDeliveryAttendant, updateExamDeliveryAttendant, deleteExamDeliveryAttendant,
    addProfessional, updateProfessional, deleteProfessional,
    addScriptCategory: (viewType: string, category: Omit<Category, "id">) => addCategory('categories', viewType, category),
    updateScriptCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => updateCategory('categories', categoryId, updates),
    deleteScriptCategory: (viewType: string, categoryId: string) => deleteCategory('categories', categoryId),
    addScript, updateScript, deleteScript,
    addExamCategory: (viewType: string, category: Omit<Category, "id">) => addCategory('categories', viewType, category),
    updateExamCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => updateCategory('categories', categoryId, updates),
    deleteExamCategory: (viewType: string, categoryId: string) => deleteCategory('categories', categoryId),
    addExam, updateExam, deleteExam,
    addContactCategory: (viewType: string, category: Omit<Category, "id">) => addCategory('categories', viewType, category),
    updateContactCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => updateCategory('categories', categoryId, updates),
    deleteContactCategory: (viewType: string, categoryId: string) => deleteCategory('categories', categoryId),
    addValueTableCategory: (viewType: string, category: Omit<Category, "id">) => addCategory('categories', viewType, category),
    updateValueTableCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => updateCategory('categories', categoryId, updates),
    deleteValueTableCategory: (viewType: string, categoryId: string) => deleteCategory('categories', categoryId),
    addValueTable, updateValueTable, deleteValueTable,
    setValueTableCategoryItems,
    addRecadoCategory, updateRecadoCategory, deleteRecadoCategory,
    addRecadoItem, updateRecadoItem, deleteRecadoItem,
    addInfoTag, updateInfoTag, deleteInfoTag,
    addInfoItem: (item: Omit<InfoItem, "id" | "date" | "tagId"> & { tagId: string }) => addInfoItem(item),
    updateInfoItem, deleteInfoItem,
    syncExamsFromValueTable,
  }), [
    supabaseLoading, supabaseError, scriptCategories, scriptData, examCategories, examData, contactCategories, contactData, valueTableCategories, valueTableData, professionalData, officeData, noticeData, headerTagData, examDeliveryAttendants, recadoCategories, recadoData, infoTags, infoData, tussCodes, userName, hasUnsavedChanges, setUserName, saveToLocalStorage, exportAllData, importAllData, importTussCodes, clearTussCodes, updateHeaderTag, addNotice, updateNotice, deleteNotice, addOffice, updateOffice, deleteOffice, addExamDeliveryAttendant, updateExamDeliveryAttendant, deleteExamDeliveryAttendant, addProfessional, updateProfessional, deleteProfessional, addScript, updateScript, deleteScript, addExam, updateExam, deleteExam, addContact, updateContact, deleteContact, addValueTable, updateValueTable, deleteValueTable, setValueTableCategoryItems, addRecadoCategory, updateRecadoCategory, deleteRecadoCategory, addRecadoItem, updateRecadoItem, deleteRecadoItem, addInfoTag, updateInfoTag, deleteInfoTag, addInfoItem, updateInfoItem, deleteInfoItem, syncExamsFromValueTable, addCategory, updateCategory, deleteCategory, createItem, updateItem, deleteItem, refetchAll
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};