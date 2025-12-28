import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Category,
  ScriptItem,
  ExamItem,
  ContactItem,
  ValueTableItem,
  Professional,
  Office,
  Notice,
  HeaderTagInfo,
  ExamDeliveryAttendant,
  RecadoCategory,
  RecadoItem,
  InfoTag,
  InfoItem,
} from "@/types/data";
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

// Mapeamento de Categoria (DbCategory -> Category)
const mapDbCategoryToFE = (dbCat: DbCategory): Category => ({
  id: dbCat.id,
  name: dbCat.name,
  color: dbCat.color,
  view_type: dbCat.view_type,
});

// Mapeamento de Script (DbScript -> ScriptItem)
const mapDbScriptToFE = (dbScript: DbScript): ScriptItem => ({
  id: dbScript.id,
  title: dbScript.title,
  content: dbScript.content,
  order: dbScript.order || undefined,
  category_id: dbScript.category_id,
});

// Mapeamento de Exame (DbExam -> ExamItem)
const mapDbExamToFE = (dbExam: DbExam): ExamItem => ({
  id: dbExam.id,
  code: dbExam.category_id, // Usando category_id como código temporário se code não existir
  title: dbExam.title,
  mainLocation: dbExam.location[0] as 'CDU' | 'HOSPITAL' | 'EXTERNO', // Assumindo que location é um array de 1 item
  sectors: dbExam.location, // Mantendo location como sectors
  extension: dbExam.extension,
  additionalInfo: dbExam.additional_info || '',
  rules: (dbExam.scheduling_rules as any)?.rules || '', // Mapeando rules de scheduling_rules
  category_id: dbExam.category_id,
});

// Mapeamento de Contato (DbContact -> ContactItem)
const mapDbContactToFE = (dbContact: DbContact): ContactItem => ({
  id: dbContact.id,
  setor: dbContact.setor,
  local: dbContact.local || '',
  ramal: dbContact.ramal || '',
  telefone: dbContact.telefone || '',
  whatsapp: dbContact.whatsapp || '',
});

// Mapeamento de ValueTable (DbValueTable -> ValueTableItem)
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

// Mapeamento de Professional (DbProfessional -> Professional)
const mapDbProfessionalToFE = (dbProf: DbProfessional): Professional => ({
  id: dbProf.id,
  name: dbProf.name,
  gender: dbProf.gender as 'masculino' | 'feminino',
  specialty: dbProf.specialty,
  ageRange: dbProf.age_range || '',
  fittings: {
    allowed: (dbProf.fittings as any)?.allowed || false,
    max: (dbProf.fittings as any)?.max || 0,
    details: (dbProf.fittings as any)?.details || '',
  },
  generalObs: dbProf.general_obs || '',
  performedExams: (dbProf.performed_exams as any) || [],
});

// Mapeamento de Office (DbOffice -> Office)
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

// Mapeamento de Notice (DbNotice -> Notice)
const mapDbNoticeToFE = (dbNotice: DbNotice): Notice => ({
  id: dbNotice.id,
  title: dbNotice.title,
  content: dbNotice.content,
  date: dbNotice.date,
  tag: dbNotice.tag as any,
});

// Mapeamento de HeaderTag (DbHeaderTag -> HeaderTagInfo)
const mapDbHeaderTagToFE = (dbTag: DbHeaderTag): HeaderTagInfo => ({
  id: dbTag.id,
  tag: dbTag.tag,
  title: dbTag.title,
  address: dbTag.address || '',
  phones: (dbTag.phones as any) || [],
  whatsapp: dbTag.whatsapp || '',
  contacts: (dbTag.contacts as any) || [],
});

// Mapeamento de ExamDeliveryAttendant (DbExamDeliveryAttendant -> ExamDeliveryAttendant)
const mapDbExamDeliveryAttendantToFE = (dbAttendant: DbExamDeliveryAttendant): ExamDeliveryAttendant => ({
  id: dbAttendant.id,
  name: dbAttendant.name,
  chatNick: dbAttendant.chat_nick,
});

// Mapeamento de RecadoCategory (DbRecadoCategory -> RecadoCategory)
const mapDbRecadoCategoryToFE = (dbCat: DbRecadoCategory): RecadoCategory => ({
  id: dbCat.id,
  title: dbCat.title,
  description: dbCat.description,
  destinationType: dbCat.destination_type as 'attendant' | 'group',
  groupName: dbCat.group_name || '',
  attendants: (dbCat.attendants as any) || [],
});

// Mapeamento de RecadoItem (DbRecado -> RecadoItem)
const mapDbRecadoItemToFE = (dbRecado: DbRecado): RecadoItem => ({
  id: dbRecado.id,
  title: dbRecado.title,
  content: dbRecado.content || '',
  fields: (dbRecado.fields as any) || [],
  category_id: dbRecado.category_id,
});

// Mapeamento de InfoTag (DbInfoTag -> InfoTag)
const mapDbInfoTagToFE = (dbTag: DbInfoTag): InfoTag => ({
  id: dbTag.id,
  name: dbTag.name,
  color: dbTag.color,
});

// Mapeamento de InfoItem (DbInfo -> InfoItem)
const mapDbInfoItemToFE = (dbInfo: DbInfo): InfoItem => ({
  id: dbInfo.id,
  title: dbInfo.title,
  content: dbInfo.content || '',
  tagId: dbInfo.tag_id,
  date: dbInfo.date || new Date(dbInfo.created_at).toLocaleDateString("pt-BR"),
  attachments: (dbInfo.attachments as any) || [],
});


// --- Estrutura de Retorno do Hook ---
interface SupabaseDataState {
  loading: boolean;
  error: string | null;
  // Estruturas de dados
  categories: DbCategory[];
  scripts: DbScript[];
  exams: DbExam[];
  contacts: DbContact[];
  valueTables: DbValueTable[];
  professionals: DbProfessional[];
  offices: DbOffice[];
  notices: DbNotice[];
  headerTags: DbHeaderTag[];
  examDeliveryAttendants: DbExamDeliveryAttendant[];
  recadoCategories: DbRecadoCategory[];
  recadoItems: DbRecado[];
  infoTags: DbInfoTag[];
  infoItems: DbInfo[];

  // Funções CRUD genéricas (apenas para admins)
  createItem: (table: string, item: any) => Promise<any>;
  updateItem: (table: string, id: string, updates: any) => Promise<any>;
  deleteItem: (table: string, id: string) => Promise<void>;
  refetchAll: () => Promise<void>;
}

export const useSupabaseData = (): SupabaseDataState => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para armazenar os dados brutos do Supabase
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [scripts, setScripts] = useState<DbScript[]>([]);
  const [exams, setExams] = useState<DbExam[]>([]);
  const [contacts, setContacts] = useState<DbContact[]>([]);
  const [valueTables, setValueTables] = useState<DbValueTable[]>([]);
  const [professionals, setProfessionals] = useState<DbProfessional[]>([]);
  const [offices, setOffices] = useState<DbOffice[]>([]);
  const [notices, setNotices] = useState<DbNotice[]>([]);
  const [headerTags, setHeaderTags] = useState<DbHeaderTag[]>([]);
  const [examDeliveryAttendants, setExamDeliveryAttendants] = useState<DbExamDeliveryAttendant[]>([]);
  const [recadoCategories, setRecadoCategories] = useState<DbRecadoCategory[]>([]);
  const [recadoItems, setRecadoItems] = useState<DbRecado[]>([]);
  const [infoTags, setInfoTags] = useState<DbInfoTag[]>([]);
  const [infoItems, setInfoItems] = useState<DbInfo[]>([]);

  const fetchTable = useCallback(async (table: string, setState: (data: any) => void, selectColumns: string = '*') => {
    const { data, error } = await supabase
      .from(table)
      .select(selectColumns);

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      // Não definimos o erro globalmente aqui para permitir que outras tabelas carreguem
      return [];
    }
    setState(data || []);
    return data || [];
  }, []);

  const refetchAll = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Usando nomes de tabela como strings literais para maior robustez
      await Promise.all([
        fetchTable('categories', setCategories),
        fetchTable('scripts', setScripts),
        fetchTable('exams', setExams),
        fetchTable('contacts', setContacts),
        fetchTable('value_tables', setValueTables),
        fetchTable('professionals', setProfessionals),
        fetchTable('offices', setOffices),
        fetchTable('notices', setNotices),
        fetchTable('header_tags', setHeaderTags),
        fetchTable('exam_delivery_attendants', setExamDeliveryAttendants),
        fetchTable('recado_categories', setRecadoCategories),
        fetchTable('recados', setRecadoItems),
        fetchTable('info_tags', setInfoTags),
        fetchTable('infos', setInfoItems),
      ]);
    } catch (e) {
      console.error("Error during refetchAll:", e);
      setError("Falha ao carregar todos os dados do servidor.");
    } finally {
      setLoading(false);
    }
  }, [user, fetchTable]);

  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  // --- CRUD Operations (Admin Only via RLS) ---

  const createItem = async (table: string, item: any) => {
    const { data, error } = await supabase
      .from(table)
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error(`Error creating item in ${table}:`, error);
      toast.error(`Erro ao criar item em ${table}: ${error.message}`);
      throw new Error(error.message);
    }
    refetchAll();
    return data;
  };

  const updateItem = async (table: string, id: string, updates: any) => {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating item in ${table}:`, error);
      toast.error(`Erro ao atualizar item em ${table}: ${error.message}`);
      throw new Error(error.message);
    }
    refetchAll();
    return data;
  };

  const deleteItem = async (table: string, id: string) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting item in ${table}:`, error);
      toast.error(`Erro ao excluir item em ${table}: ${error.message}`);
      throw new Error(error.message);
    }
    refetchAll();
  };

  return {
    loading,
    error,
    categories,
    scripts,
    exams,
    contacts,
    valueTables,
    professionals,
    offices,
    notices,
    headerTags,
    examDeliveryAttendants,
    recadoCategories,
    recadoItems,
    infoTags,
    infoItems,
    createItem,
    updateItem,
    deleteItem,
    refetchAll,
  };
};