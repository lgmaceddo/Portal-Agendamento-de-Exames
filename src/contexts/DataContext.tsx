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
  importAllData: (jsonData: string) => boolean;

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

  const importAllData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);

      if (!data || typeof data !== 'object') return false;

      // Importação de dados Supabase (requer lógica de INSERT/UPDATE)
      // Por simplicidade e para evitar conflitos de ID, esta função será limitada a dados locais.
      // A importação de dados Supabase deve ser feita via API ou console.

      if (data.tussCodes) setTussCodes(data.tussCodes);
      if (data.userName) setUserName(data.userName);
      
      // Força o salvamento dos dados locais importados
      localStorage.setItem('portalTussCodes', JSON.stringify(data.tussCodes || []));
      localStorage.setItem('portalUserName', data.userName || '');
      
      toast.warning("A importação de dados Supabase (Scripts, Exames, etc.) deve ser feita manualmente. Apenas dados locais (TUSS, Nome) foram importados.");

      // Força o refetch para garantir que o estado do Supabase seja o mais recente
      refetchAll();
      return true;
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      return false;
    }
  };

  const importTussCodes = (codes: TussCode[]) => {
    setTussCodes(codes);
    setHasUnsavedChanges(true);
  };

  const clearTussCodes = () => {
    setTussCodes([]);
    setHasUnsavedChanges(true);
  };

  // --- Funções CRUD (Mapeamento para Supabase) ---

  // Helper para mapear FE para DB (apenas campos necessários para INSERT/UPDATE)
  const mapFEToDb = (table: keyof Database['public']['Tables'], feData: any) => {
    switch (table) {
      case 'categories':
        return { name: feData.name, color: feData.color, view_type: feData.viewType };
      case 'scripts':
        return { title: feData.title, content: feData.content, order: feData.order, category_id: feData.categoryId };
      case 'exams':
        return { 
          title: feData.title, 
          location: feData.sectors, 
          extension: feData.extension, 
          additional_info: feData.additionalInfo, 
          scheduling_rules: { rules: feData.rules },
          category_id: feData.categoryId,
          view_type: feData.mainLocation, // Usando mainLocation como view_type
        };
      case 'contacts':
        return { setor: feData.setor, local: feData.local, ramal: feData.ramal, telefone: feData.telefone, whatsapp: feData.whatsapp };
      case 'value_tables':
        return { 
          codigo: feData.codigo, 
          nome: feData.nome, 
          info: feData.info, 
          honorario: feData.honorario, 
          exame_cartao: feData.exame_cartao, 
          material_min: feData.material_min, 
          material_max: feData.material_max, 
          honorarios_diferenciados: feData.honorarios_diferenciados,
          category_id: feData.categoryId,
        };
      case 'professionals':
        return { 
          name: feData.name, 
          gender: feData.gender, 
          specialty: feData.specialty, 
          age_range: feData.ageRange, 
          fittings: feData.fittings, 
          general_obs: feData.generalObs, 
          performed_exams: feData.performedExams 
        };
      case 'offices':
        return { 
          name: feData.name, 
          ramal: feData.ramal, 
          schedule: feData.schedule, 
          specialties: feData.specialties, 
          attendants: feData.attendants, 
          professionals: feData.professionals, 
          procedures: feData.procedures 
        };
      case 'notices':
        return { title: feData.title, content: feData.content, date: feData.date, tag: feData.tag };
      case 'header_tags':
        return { title: feData.title, address: feData.address, phones: feData.phones, whatsapp: feData.whatsapp, contacts: feData.contacts };
      case 'exam_delivery_attendants':
        return { name: feData.name, chat_nick: feData.chatNick };
      case 'recado_categories':
        return { title: feData.title, description: feData.description, destination_type: feData.destinationType, group_name: feData.groupName, attendants: feData.attendants };
      case 'recados':
        return { title: feData.title, content: feData.content, fields: feData.fields, category_id: feData.categoryId };
      case 'info_tags':
        return { name: feData.name, color: feData.color };
      case 'infos':
        return { title: feData.title, content: feData.content, tag_id: feData.tagId, date: feData.date, attachments: feData.attachments };
      default:
        return feData;
    }
  };

  // --- CATEGORIES (Scripts, Exams, Values) ---
  const addCategory = useCallback(async (table: keyof Database['public']['Tables'], viewType: string, category: Omit<Category, "id">) => {
    await createItem(table, { ...mapFEToDb(table, { ...category, viewType }), view_type: viewType });
  }, [createItem]);

  const updateCategory = useCallback(async (table: keyof Database['public']['Tables'], categoryId: string, updates: Partial<Category>) => {
    await updateItem(table, categoryId, mapFEToDb(table, updates));
  }, [updateItem]);

  const deleteCategory = useCallback(async (table: keyof Database['public']['Tables'], categoryId: string) => {
    await deleteItem(table, categoryId);
  }, [deleteItem]);

  // --- SCRIPTS ---
  const addScript = useCallback(async (viewType: string, categoryId: string, script: Omit<ScriptItem, "id" | "category_id">) => {
    await createItem('scripts', mapFEToDb('scripts', { ...script, categoryId }));
  }, [createItem]);

  const updateScript = useCallback(async (viewType: string, categoryId: string, scriptId: string, updates: Partial<ScriptItem>) => {
    await updateItem('scripts', scriptId, mapFEToDb('scripts', updates));
  }, [updateItem]);

  const deleteScript = useCallback(async (viewType: string, categoryId: string, scriptId: string) => {
    await deleteItem('scripts', scriptId);
  }, [deleteItem]);

  // --- EXAMS ---
  const addExam = useCallback(async (viewType: string, categoryId: string, exam: Omit<ExamItem, "id" | "category_id">) => {
    const dbData = {
      title: exam.title,
      location: exam.sectors,
      extension: exam.extension,
      additional_info: exam.additionalInfo,
      scheduling_rules: { rules: exam.rules || '' },
      category_id: categoryId,
      view_type: viewType,
    };
    await createItem('exams', dbData);
  }, [createItem]);

  const updateExam = useCallback(async (viewType: string, categoryId: string, examId: string, updates: Partial<ExamItem>) => {
    const dbUpdates = {
      title: updates.title,
      location: updates.sectors,
      extension: updates.extension,
      additional_info: updates.additionalInfo,
      scheduling_rules: updates.rules ? { rules: updates.rules } : undefined,
      category_id: categoryId,
      view_type: viewType,
    };
    await updateItem('exams', examId, dbUpdates);
  }, [updateItem]);

  const deleteExam = useCallback(async (viewType: string, categoryId: string, examId: string) => {
    await deleteItem('exams', examId);
  }, [deleteItem]);

  // --- CONTACTS ---
  const addContact = useCallback(async (viewType: string, categoryId: string, contact: Omit<ContactItem, "id">) => {
    await createItem('contacts', mapFEToDb('contacts', contact));
  }, [createItem]);

  const updateContact = useCallback(async (viewType: string, categoryId: string, contactId: string, updates: Partial<ContactItem>) => {
    await updateItem('contacts', contactId, mapFEToDb('contacts', updates));
  }, [updateItem]);

  const deleteContact = useCallback(async (viewType: string, categoryId: string, contactId: string) => {
    await deleteItem('contacts', contactId);
  }, [deleteItem]);

  // --- VALUE TABLES ---
  const addValueTable = useCallback(async (viewType: string, categoryId: string, item: Omit<ValueTableItem, "id" | "category_id">) => {
    await createItem('value_tables', mapFEToDb('value_tables', { ...item, categoryId }));
  }, [createItem]);

  const updateValueTable = useCallback(async (viewType: string, categoryId: string, itemId: string, updates: Partial<Omit<ValueTableItem, "id">>) => {
    await updateItem('value_tables', itemId, mapFEToDb('value_tables', updates));
  }, [updateItem]);

  const deleteValueTable = useCallback(async (viewType: string, categoryId: string, itemId: string) => {
    await deleteItem('value_tables', itemId);
  }, [deleteItem]);

  const setValueTableCategoryItems = useCallback(async (viewType: string, categoryId: string, items: ValueTableItem[]) => {
    // Esta é uma operação complexa de substituição total.
    // 1. Excluir todos os itens existentes na categoria.
    // 2. Inserir todos os novos itens.
    // 3. Sincronizar exames.

    const existingIds = dbValueTables.filter(vt => vt.category_id === categoryId).map(vt => vt.id);
    
    // 1. Excluir (usando RPC ou loop, mas Supabase não suporta DELETE WHERE IN nativamente na API JS sem RLS complexo)
    // Vamos usar um loop simples para garantir que o RLS funcione para cada exclusão.
    for (const id of existingIds) {
        await deleteItem('value_tables', id);
    }

    // 2. Inserir novos itens
    const insertData = items.map(item => ({
      ...mapFEToDb('value_tables', { ...item, categoryId }),
      id: item.id, // Mantém o ID gerado no merge para estabilidade
      category_id: categoryId,
    }));

    if (insertData.length > 0) {
      const { error } = await supabase.from('value_tables').insert(insertData);
      if (error) {
        toast.error(`Erro ao inserir novos itens: ${error.message}`);
        throw new Error(error.message);
      }
    }
    
    // 3. Refetch e Sincronização
    await refetchAll();
    await syncExamsFromValueTable();

  }, [dbValueTables, deleteItem, refetchAll]);

  // --- PROFESSIONALS ---
  const addProfessional = useCallback(async (viewType: string, categoryId: string, professional: Omit<Professional, "id">) => {
    await createItem('professionals', mapFEToDb('professionals', professional));
  }, [createItem]);

  const updateProfessional = useCallback(async (viewType: string, categoryId: string, professionalId: string, updates: Partial<Omit<Professional, "id">>) => {
    await updateItem('professionals', professionalId, mapFEToDb('professionals', updates));
  }, [updateItem]);

  const deleteProfessional = useCallback(async (viewType: string, categoryId: string, professionalId: string) => {
    await deleteItem('professionals', professionalId);
  }, [deleteItem]);

  // --- OFFICES ---
  const addOffice = useCallback(async (office: Omit<Office, "id">) => {
    await createItem('offices', mapFEToDb('offices', office));
  }, [createItem]);

  const updateOffice = useCallback(async (office: Office) => {
    await updateItem('offices', office.id, mapFEToDb('offices', office));
  }, [updateItem]);

  const deleteOffice = useCallback(async (id: string) => {
    await deleteItem('offices', id);
  }, [deleteItem]);

  // --- NOTICES ---
  const addNotice = useCallback(async (notice: Omit<Notice, "id">) => {
    await createItem('notices', mapFEToDb('notices', notice));
  }, [createItem]);

  const updateNotice = useCallback(async (notice: Notice) => {
    await updateItem('notices', notice.id, mapFEToDb('notices', notice));
  }, [updateItem]);

  const deleteNotice = useCallback(async (id: string) => {
    await deleteItem('notices', id);
  }, [deleteItem]);

  // --- HEADER TAGS ---
  const updateHeaderTag = useCallback(async (id: string, updates: Omit<HeaderTagInfo, "id" | "tag">) => {
    await updateItem('header_tags', id, mapFEToDb('header_tags', updates));
  }, [updateItem]);

  // --- EXAM DELIVERY ATTENDANTS ---
  const addExamDeliveryAttendant = useCallback(async (attendant: Omit<ExamDeliveryAttendant, "id">) => {
    await createItem('exam_delivery_attendants', mapFEToDb('exam_delivery_attendants', attendant));
  }, [createItem]);

  const updateExamDeliveryAttendant = useCallback(async (attendant: ExamDeliveryAttendant) => {
    await updateItem('exam_delivery_attendants', attendant.id, mapFEToDb('exam_delivery_attendants', attendant));
  }, [updateItem]);

  const deleteExamDeliveryAttendant = useCallback(async (id: string) => {
    await deleteItem('exam_delivery_attendants', id);
  }, [deleteItem]);

  // --- RECADOS ---
  const addRecadoCategory = useCallback(async (category: Omit<RecadoCategory, "id">) => {
    await createItem('recado_categories', mapFEToDb('recado_categories', category));
  }, [createItem]);

  const updateRecadoCategory = useCallback(async (category: RecadoCategory) => {
    await updateItem('recado_categories', category.id, mapFEToDb('recado_categories', category));
  }, [updateItem]);

  const deleteRecadoCategory = useCallback(async (categoryId: string) => {
    await deleteItem('recado_categories', categoryId);
  }, [deleteItem]);

  const addRecadoItem = useCallback(async (categoryId: string, item: Omit<RecadoItem, "id" | "category_id">) => {
    await createItem('recados', mapFEToDb('recados', { ...item, categoryId }));
  }, [createItem]);

  const updateRecadoItem = useCallback(async (categoryId: string, itemId: string, updates: Partial<RecadoItem>) => {
    await updateItem('recados', itemId, mapFEToDb('recados', updates));
  }, [updateItem]);

  const deleteRecadoItem = useCallback(async (categoryId: string, itemId: string) => {
    await deleteItem('recados', itemId);
  }, [deleteItem]);

  // --- INFO ---
  const addInfoTag = useCallback(async (tag: Omit<InfoTag, "id">) => {
    await createItem('info_tags', mapFEToDb('info_tags', tag));
  }, [createItem]);

  const updateInfoTag = useCallback(async (tag: InfoTag) => {
    await updateItem('info_tags', tag.id, mapFEToDb('info_tags', tag));
  }, [updateItem]);

  const deleteInfoTag = useCallback(async (tagId: string) => {
    await deleteItem('info_tags', tagId);
  }, [deleteItem]);

  const addInfoItem = useCallback(async (item: Omit<InfoItem, "id" | "date" | "tagId"> & { tagId: string }) => {
    await createItem('infos', mapFEToDb('infos', { ...item, date: new Date().toLocaleDateString("pt-BR") }));
  }, [createItem]);

  const updateInfoItem = useCallback(async (item: InfoItem) => {
    await updateItem('infos', item.id, mapFEToDb('infos', { ...item, date: new Date().toLocaleDateString("pt-BR") }));
  }, [updateItem]);

  const deleteInfoItem = useCallback(async (itemId: string, tagId: string) => {
    await deleteItem('infos', itemId);
  }, [deleteItem]);

  // --- Sincronização de Exames ---
  const syncExamsFromValueTable = useCallback(async () => {
    // 1. Obter todos os itens da tabela de valores
    const valueTableItems = dbValueTables.map(mapDbValueTableToFE);

    if (valueTableItems.length === 0) {
      toast.info("Nenhum item na Tabela de Valores para sincronizar.");
      return;
    }

    // 2. Obter todos os exames atuais
    const currentExams = dbExams.map(mapDbExamToFE);
    const examsBySyncId = new Map<string, ExamItem>();

    currentExams.forEach(exam => {
      if (exam.id.startsWith('e-sync-')) {
        examsBySyncId.set(exam.id, exam);
      }
    });

    const CAT_ID = "ex-cat-geral";
    const VIEW_TYPE = "EXAMES"; // Usando a view EXAMES para sincronização

    // 3. Processar e preparar operações
    const itemsToInsert: any[] = [];
    const itemsToUpdate: { id: string, updates: any }[] = [];
    const existingSyncIds = new Set<string>();

    valueTableItems.forEach(vtItem => {
      const syncId = `e-sync-${vtItem.id}`;
      existingSyncIds.add(syncId);
      const existing = examsBySyncId.get(syncId);

      const newExamData = {
        title: vtItem.nome,
        extension: '', // Não temos ramal na tabela de valores
        additional_info: vtItem.info || '',
        location: ['CDU'], // Padrão CDU
        scheduling_rules: { rules: '' },
        category_id: CAT_ID,
        view_type: VIEW_TYPE,
      };

      if (existing) {
        // Atualizar se houver mudanças significativas
        const hasChanges = existing.title !== vtItem.nome || existing.additionalInfo !== vtItem.info;
        if (hasChanges) {
          itemsToUpdate.push({ id: existing.id, updates: newExamData });
        }
      } else {
        // Inserir novo
        itemsToInsert.push({ ...newExamData, id: syncId });
      }
    });

    // 4. Identificar e deletar exames sincronizados que não existem mais na tabela de valores
    const idsToDelete = currentExams
      .filter(exam => exam.id.startsWith('e-sync-') && !existingSyncIds.has(exam.id))
      .map(exam => exam.id);

    // 5. Executar operações
    try {
      // Deletar
      if (idsToDelete.length > 0) {
        const { error } = await supabase.from('exams').delete().in('id', idsToDelete);
        if (error) throw error;
      }

      // Atualizar
      for (const { id, updates } of itemsToUpdate) {
        await supabase.from('exams').update(updates).eq('id', id);
      }

      // Inserir
      if (itemsToInsert.length > 0) {
        const { error } = await supabase.from('exams').insert(itemsToInsert);
        if (error) throw error;
      }

      // Garantir que a categoria GERAL exista
      const generalCatExists = dbCategories.some(c => c.id === CAT_ID);
      if (!generalCatExists) {
        await createItem('categories', { id: CAT_ID, name: 'GERAL', color: 'text-primary', view_type: VIEW_TYPE });
      }

      await refetchAll();
      toast.success(`Sincronização concluída: ${itemsToInsert.length} novos, ${itemsToUpdate.length} atualizados, ${idsToDelete.length} removidos.`);
    } catch (error) {
      console.error("Erro na sincronização:", error);
      toast.error("Erro ao sincronizar exames com a Tabela de Valores.");
    }
  }, [dbValueTables, dbExams, dbCategories, refetchAll, createItem]);


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
    addContact, updateContact, deleteContact,
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
    supabaseLoading, supabaseError, scriptCategories, scriptData, examCategories, examData, contactCategories, contactData, valueTableCategories, valueTableData, professionalData, officeData, noticeData, headerTagData, examDeliveryAttendants, recadoCategories, recadoData, infoTags, infoData, tussCodes, userName, hasUnsavedChanges, setUserName, saveToLocalStorage, exportAllData, importAllData, importTussCodes, clearTussCodes, updateHeaderTag, addNotice, updateNotice, deleteNotice, addOffice, updateOffice, deleteOffice, addExamDeliveryAttendant, updateExamDeliveryAttendant, deleteExamDeliveryAttendant, addProfessional, updateProfessional, deleteProfessional, addScript, updateScript, deleteScript, addExam, updateExam, deleteExam, addContact, updateContact, deleteContact, addValueTable, updateValueTable, deleteValueTable, setValueTableCategoryItems, addRecadoCategory, updateRecadoCategory, deleteRecadoCategory, addRecadoItem, updateRecadoItem, deleteRecadoItem, addInfoTag, updateInfoTag, deleteInfoTag, addInfoItem, updateInfoItem, deleteInfoItem, syncExamsFromValueTable, addCategory, updateCategory, deleteCategory
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