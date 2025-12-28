import { createContext, useContext, useState, ReactNode } from "react";
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
import {
  scriptCategories as initialScriptCategories,
  scriptData as initialScriptData,
  examCategories as initialExamCategories,
  examData as initialExamData,
  contactCategories as initialContactCategories,
  contactData as initialContactData,
  valueTableCategories as initialValueTableCategories,
  valueTableData as initialValueTableData,
  professionalData as initialProfessionalData,
  officeData as initialOfficeData,
  noticeData as initialNoticeData,
  headerTagData as initialHeaderTagData,
  examDeliveryAttendants as initialExamDeliveryAttendants,
  recadoCategories as initialRecadoCategories,
  recadoData as initialRecadoData,
  infoTags as initialInfoTags,
  infoData as initialInfoData,
} from "@/data/initialData";

interface DataContextType {
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
  infoTags: InfoTag[]; // NOVO
  infoData: Record<string, InfoItem[]>; // NOVO
  tussCodes: TussCode[]; // Códigos TUSS
  userName: string;
  hasUnsavedChanges: boolean;

  // User functions
  setUserName: (name: string) => void;

  // Save/Load functions
  saveToLocalStorage: () => void;

  // Import/Export functions
  exportAllData: () => string;
  importAllData: (jsonData: string) => boolean;

  // Header tag functions
  updateHeaderTag: (id: string, updates: Omit<HeaderTagInfo, "id" | "tag">) => void;

  // Notice functions
  addNotice: (notice: Omit<Notice, "id">) => void;
  updateNotice: (notice: Notice) => void;
  deleteNotice: (id: string) => void;

  // Office functions
  addOffice: (office: Omit<Office, "id">) => void;
  updateOffice: (office: Office) => void;
  deleteOffice: (id: string) => void;

  // Exam delivery attendant functions
  addExamDeliveryAttendant: (attendant: Omit<ExamDeliveryAttendant, "id">) => void;
  updateExamDeliveryAttendant: (attendant: ExamDeliveryAttendant) => void;
  deleteExamDeliveryAttendant: (id: string) => void;

  // Professional functions
  addProfessional: (viewType: string, categoryId: string, professional: Omit<Professional, "id">) => void;
  updateProfessional: (viewType: string, categoryId: string, professionalId: string, updates: Partial<Omit<Professional, "id">>) => void;
  deleteProfessional: (viewType: string, categoryId: string, professionalId: string) => void;

  // Script functions
  addScriptCategory: (viewType: string, category: Category) => void;
  updateScriptCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => void;
  deleteScriptCategory: (viewType: string, categoryId: string) => void;
  addScript: (viewType: string, categoryId: string, script: ScriptItem) => void;
  updateScript: (viewType: string, categoryId: string, scriptId: string, updates: Partial<ScriptItem>) => void;
  deleteScript: (viewType: string, categoryId: string, scriptId: string) => void;

  // Exam functions
  addExamCategory: (viewType: string, category: Category) => void;
  updateExamCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => void;
  deleteExamCategory: (viewType: string, categoryId: string) => void;
  addExam: (viewType: string, categoryId: string, exam: ExamItem) => void;
  updateExam: (viewType: string, categoryId: string, examId: string, updates: Partial<ExamItem>) => void;
  deleteExam: (viewType: string, categoryId: string, examId: string) => void;

  // Contact functions
  addContactCategory: (viewType: string, category: Category) => void;
  updateContactCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => void;
  deleteContactCategory: (viewType: string, categoryId: string) => void;
  addContact: (viewType: string, categoryId: string, contact: ContactItem) => void;
  updateContact: (viewType: string, categoryId: string, contactId: string, updates: Partial<ContactItem>) => void;
  deleteContact: (viewType: string, categoryId: string, contactId: string) => void;

  // Value table functions
  addValueTableCategory: (viewType: string, category: Category) => void;
  updateValueTableCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => void;
  deleteValueTableCategory: (viewType: string, categoryId: string) => void;
  addValueTable: (viewType: string, categoryId: string, item: Omit<ValueTableItem, "id">) => void;
  updateValueTable: (viewType: string, categoryId: string, itemId: string, updates: Partial<Omit<ValueTableItem, "id">>) => void;
  deleteValueTable: (viewType: string, categoryId: string, itemId: string) => void;
  setValueTableCategoryItems: (viewType: string, categoryId: string, items: ValueTableItem[]) => void;

  // Recado functions
  addRecadoCategory: (category: Omit<RecadoCategory, "id">) => void;
  updateRecadoCategory: (category: RecadoCategory) => void;
  deleteRecadoCategory: (categoryId: string) => void;
  addRecadoItem: (categoryId: string, item: Omit<RecadoItem, "id">) => void;
  updateRecadoItem: (categoryId: string, itemId: string, updates: Partial<RecadoItem>) => void;
  deleteRecadoItem: (categoryId: string, itemId: string) => void;

  // Info functions (NOVO)
  addInfoTag: (tag: Omit<InfoTag, "id">) => void;
  updateInfoTag: (tag: InfoTag) => void;
  deleteInfoTag: (tagId: string) => void;
  addInfoItem: (item: Omit<InfoItem, "id" | "date">) => void;
  updateInfoItem: (item: InfoItem) => void;
  deleteInfoItem: (itemId: string, tagId: string) => void;
  syncExamsFromValueTable: () => void;

  // TUSS Codes functions
  importTussCodes: (codes: TussCode[]) => void;
  clearTussCodes: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const sortContacts = (contacts: ContactItem[]): ContactItem[] => {
  return contacts.sort((a, b) => a.setor.localeCompare(b.setor, 'pt-BR'));
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Carregar dados do localStorage ou usar iniciais
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('portalData');
      if (saved) {
        let data = JSON.parse(saved);

        // Migração de dados de exames (location -> sectors e adição de mainLocation)
        if (data.examData) {
          const migratedExamData = { ...data.examData };
          Object.keys(migratedExamData).forEach(viewType => {
            const categories = migratedExamData[viewType];
            Object.keys(categories).forEach(catId => {
              categories[catId] = categories[catId].map((exam: any) => ({
                ...exam,
                mainLocation: exam.mainLocation || viewType || 'CDU',
                sectors: exam.sectors || exam.location || [],
              }));
            });
          });
          data.examData = migratedExamData;
        }

        return data;
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    return null;
  };

  const savedData = loadFromLocalStorage();

  const [scriptCategories, setScriptCategories] = useState(savedData?.scriptCategories || initialScriptCategories);
  const [scriptData, setScriptData] = useState(savedData?.scriptData || initialScriptData);
  const [examCategories, setExamCategories] = useState(savedData?.examCategories || initialExamCategories);
  const [examData, setExamData] = useState(savedData?.examData || initialExamData);
  const [contactCategories, setContactCategories] = useState(savedData?.contactCategories || initialContactCategories);
  const [contactData, setContactData] = useState(savedData?.contactData || initialContactData);
  const [valueTableCategories, setValueTableCategories] = useState(savedData?.valueTableCategories || initialValueTableCategories);
  const [valueTableData, setValueTableData] = useState(savedData?.valueTableData || initialValueTableData);
  const [professionalData, setProfessionalData] = useState(savedData?.professionalData || initialProfessionalData);
  const [officeData, setOfficeData] = useState<Office[]>(savedData?.officeData || initialOfficeData);
  const [noticeData, setNoticeData] = useState<Notice[]>(savedData?.noticeData || initialNoticeData);
  const [headerTagData, setHeaderTagData] = useState<HeaderTagInfo[]>(savedData?.headerTagData || initialHeaderTagData);
  const [examDeliveryAttendants, setExamDeliveryAttendants] = useState<ExamDeliveryAttendant[]>(savedData?.examDeliveryAttendants || initialExamDeliveryAttendants);
  const [recadoCategories, setRecadoCategories] = useState<RecadoCategory[]>(savedData?.recadoCategories || initialRecadoCategories);
  const [recadoData, setRecadoData] = useState<Record<string, RecadoItem[]>>(savedData?.recadoData || initialRecadoData);

  // NOVOS ESTADOS
  const [infoTags, setInfoTags] = useState<InfoTag[]>(savedData?.infoTags || initialInfoTags);
  const [infoData, setInfoData] = useState<Record<string, InfoItem[]>>(savedData?.infoData || initialInfoData);
  const [tussCodes, setTussCodes] = useState<TussCode[]>(savedData?.tussCodes || []);

  const [userName, setUserNameState] = useState<string>(() => {
    const saved = localStorage.getItem('portalUserName');
    return saved || '';
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- Info Functions (NOVO) ---
  const addInfoTag = (tag: Omit<InfoTag, "id">) => {
    const newTag: InfoTag = {
      ...tag,
      id: `info-tag-${Date.now()}`,
    };
    setInfoTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
    setInfoData(prev => ({
      ...prev,
      [newTag.id]: [],
    }));
    setHasUnsavedChanges(true);
  };

  const updateInfoTag = (tag: InfoTag) => {
    setInfoTags(prev => prev.map(t => t.id === tag.id ? tag : t).sort((a, b) => a.name.localeCompare(b.name)));
    setHasUnsavedChanges(true);
  };

  const deleteInfoTag = (tagId: string) => {
    setInfoTags(prev => prev.filter(t => t.id !== tagId));
    setInfoData(prev => {
      const { [tagId]: deleted, ...rest } = prev;
      return rest;
    });
    setHasUnsavedChanges(true);
  };

  const addInfoItem = (item: Omit<InfoItem, "id" | "date">) => {
    const newItem: InfoItem = {
      ...item,
      id: `info-item-${Date.now()}`,
      date: new Date().toLocaleDateString("pt-BR"),
    };
    setInfoData(prev => ({
      ...prev,
      [item.tagId]: [...(prev[item.tagId] || []), newItem].sort((a, b) => a.title.localeCompare(b.title)),
    }));
    setHasUnsavedChanges(true);
  };

  const updateInfoItem = (item: InfoItem) => {
    setInfoData(prev => ({
      ...prev,
      [item.tagId]: (prev[item.tagId] || []).map(i =>
        i.id === item.id ? { ...item, date: new Date().toLocaleDateString("pt-BR") } : i
      ).sort((a, b) => a.title.localeCompare(b.title)),
    }));
    setHasUnsavedChanges(true);
  };

  const deleteInfoItem = (itemId: string, tagId: string) => {
    setInfoData(prev => ({
      ...prev,
      [tagId]: (prev[tagId] || []).filter(item => item.id !== itemId),
    }));
    setHasUnsavedChanges(true);
  };
  // --- Fim Info Functions ---

  // --- TUSS Codes Functions ---
  const importTussCodes = (codes: TussCode[]) => {
    setTussCodes(codes);
    setHasUnsavedChanges(true);
  };

  const clearTussCodes = () => {
    setTussCodes([]);
    setHasUnsavedChanges(true);
  };
  // --- Fim TUSS Codes Functions ---

  // --- Recado Functions ---
  const addRecadoCategory = (category: Omit<RecadoCategory, "id">) => {
    const newCategory: RecadoCategory = {
      ...category,
      id: `rec-cat-${Date.now()}`,
    };
    setRecadoCategories(prev => [...prev, newCategory]);
    setRecadoData(prev => ({
      ...prev,
      [newCategory.id]: [],
    }));
    setHasUnsavedChanges(true);
  };

  const updateRecadoCategory = (category: RecadoCategory) => {
    setRecadoCategories(prev => prev.map(c => c.id === category.id ? category : c));
    setHasUnsavedChanges(true);
  };

  const deleteRecadoCategory = (categoryId: string) => {
    setRecadoCategories(prev => prev.filter(c => c.id !== categoryId));
    setRecadoData(prev => {
      const { [categoryId]: deleted, ...rest } = prev;
      return rest;
    });
    setHasUnsavedChanges(true);
  };

  const addRecadoItem = (categoryId: string, item: Omit<RecadoItem, "id">) => {
    const newItem: RecadoItem = {
      ...item,
      id: `rec-item-${Date.now()}`,
    };
    setRecadoData(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), newItem],
    }));
    setHasUnsavedChanges(true);
  };

  const updateRecadoItem = (categoryId: string, itemId: string, updates: Partial<RecadoItem>) => {
    setRecadoData(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const deleteRecadoItem = (categoryId: string, itemId: string) => {
    setRecadoData(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter(item => item.id !== itemId),
    }));
    setHasUnsavedChanges(true);
  };
  // --- Fim Recado Functions ---

  // Notice functions
  const addNotice = (notice: Omit<Notice, "id">) => {
    const newNotice: Notice = {
      ...notice,
      id: `notice-${Date.now()}`,
    };
    setNoticeData(prev => [newNotice, ...prev]);
    setHasUnsavedChanges(true);
  };

  const updateNotice = (notice: Notice) => {
    setNoticeData(prev =>
      prev.map(n => n.id === notice.id ? notice : n)
    );
    setHasUnsavedChanges(true);
  };

  const deleteNotice = (id: string) => {
    setNoticeData(prev => prev.filter(n => n.id !== id));
    setHasUnsavedChanges(true);
  };

  // Office functions
  const addOffice = (office: Omit<Office, "id">) => {
    const newOffice: Office = {
      ...office,
      id: `office-${Date.now()}`,
    };
    setOfficeData(prev => [...prev, newOffice].sort((a, b) => a.name.localeCompare(b.name)));
    setHasUnsavedChanges(true);
  };

  const updateOffice = (office: Office) => {
    setOfficeData(prev =>
      prev.map(o => o.id === office.id ? office : o).sort((a, b) => a.name.localeCompare(b.name))
    );
    setHasUnsavedChanges(true);
  };

  const deleteOffice = (id: string) => {
    setOfficeData(prev => prev.filter(o => o.id !== id));
    setHasUnsavedChanges(true);
  };

  // Exam delivery attendant functions
  const addExamDeliveryAttendant = (attendant: Omit<ExamDeliveryAttendant, "id">) => {
    const newAttendant: ExamDeliveryAttendant = {
      ...attendant,
      id: `eda-${Date.now()}`,
    };
    setExamDeliveryAttendants(prev => [...prev, newAttendant].sort((a, b) => a.name.localeCompare(b.name)));
    setHasUnsavedChanges(true);
  };

  const updateExamDeliveryAttendant = (attendant: ExamDeliveryAttendant) => {
    setExamDeliveryAttendants(prev =>
      prev.map(a => a.id === attendant.id ? attendant : a).sort((a, b) => a.name.localeCompare(b.name))
    );
    setHasUnsavedChanges(true);
  };

  const deleteExamDeliveryAttendant = (id: string) => {
    setExamDeliveryAttendants(prev => prev.filter(a => a.id !== id));
    setHasUnsavedChanges(true);
  };

  // Script category functions
  const addScriptCategory = (viewType: string, category: Category) => {
    setScriptCategories(prev => ({
      ...prev,
      [viewType]: [...(prev[viewType] || []), category],
    }));
    setScriptData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [category.id]: [],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const updateScriptCategory = (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setScriptCategories(prev => ({
      ...prev,
      [viewType]: (prev[viewType] || []).map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const deleteScriptCategory = (viewType: string, categoryId: string) => {
    setScriptCategories(prev => ({
      ...prev,
      [viewType]: (prev[viewType] || []).filter(cat => cat.id !== categoryId),
    }));
    setScriptData(prev => {
      const newData = { ...prev };
      if (newData[viewType]) {
        const { [categoryId]: deleted, ...rest } = newData[viewType];
        newData[viewType] = rest;
      }
      return newData;
    });
    setHasUnsavedChanges(true);
  };

  // Script functions
  const addScript = (viewType: string, categoryId: string, script: ScriptItem) => {
    setScriptData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: [...(prev[viewType]?.[categoryId] || []), script],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const updateScript = (viewType: string, categoryId: string, scriptId: string, updates: Partial<ScriptItem>) => {
    setScriptData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: (prev[viewType]?.[categoryId] || []).map(script =>
          script.id === scriptId ? { ...script, ...updates } : script
        ),
      },
    }));
    setHasUnsavedChanges(true);
  };

  const deleteScript = (viewType: string, categoryId: string, scriptId: string) => {
    setScriptData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: (prev[viewType]?.[categoryId] || []).filter(script => script.id !== scriptId),
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Exam category functions
  const addExamCategory = (viewType: string, category: Category) => {
    setExamCategories(prev => ({
      ...prev,
      [viewType]: [...(prev[viewType] || []), category],
    }));
    setExamData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [category.id]: [],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const updateExamCategory = (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setExamCategories(prev => ({
      ...prev,
      [viewType]: (prev[viewType] || []).map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const deleteExamCategory = (viewType: string, categoryId: string) => {
    setExamCategories(prev => ({
      ...prev,
      [viewType]: (prev[viewType] || []).filter(cat => cat.id !== categoryId),
    }));
    setExamData(prev => {
      const newData = { ...prev };
      if (newData[viewType]) {
        const { [categoryId]: deleted, ...rest } = newData[viewType];
        newData[viewType] = rest;
      }
      return newData;
    });
    setHasUnsavedChanges(true);
  };

  // Exam functions
  const addExam = (viewType: string, categoryId: string, exam: ExamItem) => {
    setExamData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: [...(prev[viewType]?.[categoryId] || []), exam],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const updateExam = (viewType: string, categoryId: string, examId: string, updates: Partial<ExamItem>) => {
    setExamData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: (prev[viewType]?.[categoryId] || []).map(exam =>
          exam.id === examId ? { ...exam, ...updates } : exam
        ),
      },
    }));
    setHasUnsavedChanges(true);
  };

  const deleteExam = (viewType: string, categoryId: string, examId: string) => {
    setExamData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: (prev[viewType]?.[categoryId] || []).filter(exam => exam.id !== examId),
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Contact category functions (Simplificadas para a nova estrutura)
  const addContactCategory = (viewType: string, category: Category) => {
    // Não permite adicionar novas categorias se o viewType for GERAL
    if (viewType === 'GERAL') return;
    setContactCategories(prev => ({
      ...prev,
      [viewType]: [...(prev[viewType] || []), category],
    }));
    setContactData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [category.id]: [],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const updateContactCategory = (viewType: string, categoryId: string, updates: Partial<Category>) => {
    // Permite apenas a atualização da categoria GERAL
    if (viewType !== 'GERAL') {
      setContactCategories(prev => ({
        ...prev,
        [viewType]: (prev[viewType] || []).map(cat =>
          cat.id === categoryId ? { ...cat, ...updates } : cat
        ),
      }));
      setHasUnsavedChanges(true);
    }
  };

  const deleteContactCategory = (viewType: string, categoryId: string) => {
    // Não permite exclusão da categoria GERAL
    if (viewType === 'GERAL') return;
    setContactCategories(prev => ({
      ...prev,
      [viewType]: (prev[viewType] || []).filter(cat => cat.id !== categoryId),
    }));
    setContactData(prev => {
      const newData = { ...prev };
      if (newData[viewType]) {
        const { [categoryId]: deleted, ...rest } = newData[viewType];
        newData[viewType] = rest;
      }
      return newData;
    });
    setHasUnsavedChanges(true);
  };

  // Contact functions
  const addContact = (viewType: string, categoryId: string, contact: ContactItem) => {
    setContactData(prev => {
      const updatedItems = [...(prev[viewType]?.[categoryId] || []), contact];
      return {
        ...prev,
        [viewType]: {
          ...(prev[viewType] || {}),
          [categoryId]: sortContacts(updatedItems),
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  const updateContact = (viewType: string, categoryId: string, contactId: string, updates: Partial<ContactItem>) => {
    setContactData(prev => {
      const updatedItems = (prev[viewType]?.[categoryId] || []).map(contact =>
        contact.id === contactId ? { ...contact, ...updates } : contact
      );
      return {
        ...prev,
        [viewType]: {
          ...(prev[viewType] || {}),
          [categoryId]: sortContacts(updatedItems),
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  const deleteContact = (viewType: string, categoryId: string, contactId: string) => {
    setContactData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: (prev[viewType]?.[categoryId] || []).filter(contact => contact.id !== contactId),
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Value table category functions
  const addValueTableCategory = (viewType: string, category: Category) => {
    setValueTableCategories(prev => ({
      ...prev,
      [viewType]: [...(prev[viewType] || []), category],
    }));
    setValueTableData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [category.id]: [],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const updateValueTableCategory = (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setValueTableCategories(prev => ({
      ...prev,
      [viewType]: (prev[viewType] || []).map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const deleteValueTableCategory = (viewType: string, categoryId: string) => {
    setValueTableCategories(prev => ({
      ...prev,
      [viewType]: (prev[viewType] || []).filter(cat => cat.id !== categoryId),
    }));
    setValueTableData(prev => {
      const newData = { ...prev };
      if (newData[viewType]) {
        const { [categoryId]: deleted, ...rest } = newData[viewType];
        newData[viewType] = rest;
      }
      return newData;
    });
    setHasUnsavedChanges(true);
  };

  // Value table functions
  const addValueTable = (viewType: string, categoryId: string, item: Omit<ValueTableItem, "id">) => {
    const newItem: ValueTableItem = {
      ...item,
      id: `vt-${Date.now()}`,
    };
    setValueTableData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: [...(prev[viewType]?.[categoryId] || []), newItem],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const updateValueTable = (viewType: string, categoryId: string, itemId: string, updates: Partial<Omit<ValueTableItem, "id">>) => {
    setValueTableData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: (prev[viewType]?.[categoryId] || []).map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      },
    }));
    setHasUnsavedChanges(true);
  };

  const deleteValueTable = (viewType: string, categoryId: string, itemId: string) => {
    setValueTableData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: (prev[viewType]?.[categoryId] || []).filter(item => item.id !== itemId),
      },
    }));
    setHasUnsavedChanges(true);
  };

  const syncExamsFromValueTable = () => {
    syncExamsFromValueTableWithItems();
  };


  // Função para substituição TOTAL de uma categoria na Tabela de Valores
  const setValueTableCategoryItems = (viewType: string, categoryId: string, items: ValueTableItem[]) => {
    console.log(`[DataContext] Iniciando substituição TOTAL de ${items.length} itens.`);

    // Usamos o setter funcional para garantir que nada se perca por concorrência
    setValueTableData(currentValueData => {
      // Cria o novo estado limpando o anterior para esta categoria específica
      const updatedValueTableData = {
        ...currentValueData,
        [viewType]: {
          ...(currentValueData[viewType] || {}),
          [categoryId]: items, // Substituição direta (exclui os antigos desta categoria)
        },
      };

      // Realiza a sincronização de exames baseada no novo estado da tabela de valores
      // calculateSyncExams é uma função pura que calcula o próximo estado de exames
      const syncResult = calculateSyncExams(items, examCategories, examData);

      if (syncResult) {
        setExamCategories(syncResult.nextExamCategories);
        setExamData(syncResult.nextExamData);
      }

      setHasUnsavedChanges(true);

      // Salva de forma atômica no localStorage
      const allNewData = {
        scriptCategories, scriptData,
        contactCategories, contactData,
        valueTableCategories,
        valueTableData: updatedValueTableData,
        examCategories: syncResult?.nextExamCategories || examCategories,
        examData: syncResult?.nextExamData || examData,
        professionalData, officeData, noticeData, headerTagData,
        examDeliveryAttendants, recadoCategories, recadoData,
        infoTags, infoData,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem('portalData', JSON.stringify(allNewData));
      console.log('[DataContext] Dados antigos excluídos e novos salvos com sucesso.');

      return updatedValueTableData;
    });
  };

  // Versão pura da sincronização que recebe estados e retorna novos estados
  const calculateSyncExams = (
    valueTableItems: ValueTableItem[],
    currentExamCategories: Record<string, Category[]>,
    currentExamData: Record<string, ExamItem[]>
  ) => {
    if (valueTableItems.length === 0) return null;

    // Criar mapas para facilitar a busca
    const examsByTitle = new Map<string, { view: string, catId: string, item: ExamItem }>();
    const examsBySyncId = new Map<string, { view: string, catId: string, item: ExamItem }>();

    ["CDU", "HOSPITAL", "EXTERNO"].forEach(view => {
      const viewExamsData = (currentExamData[view] || {}) as Record<string, ExamItem[]>;
      Object.entries(viewExamsData).forEach(([catId, exams]) => {
        exams.forEach(exam => {
          const normalizedTitle = exam.title.toUpperCase().trim();
          examsByTitle.set(normalizedTitle, { view, catId, item: exam });

          if (exam.id.startsWith('e-sync-')) {
            examsBySyncId.set(exam.id, { view, catId, item: exam });
          }
        });
      });
    });

    // Mapeamos os exames atuais que vieram da Tabela de Valores para decidir o que manter
    const finalGeralExams: ExamItem[] = [];
    const VIEW_TYPE = "CDU";
    const CAT_ID = "ex-cat-geral";

    valueTableItems.forEach(vtItem => {
      const normalizedVtTitle = vtItem.nome.toUpperCase().trim();
      const syncId = `e-sync-${vtItem.id}`;

      const existing = examsBySyncId.get(syncId) || examsByTitle.get(normalizedVtTitle);

      if (existing) {
        // Atualiza ou mantém o existente
        finalGeralExams.push({
          ...existing.item,
          id: syncId, // Garante que usa o ID baseado no VT
          title: vtItem.nome,
          code: vtItem.codigo,
          additionalInfo: vtItem.info || existing.item.additionalInfo
        });
      } else {
        // Cria um novo
        finalGeralExams.push({
          id: syncId,
          code: vtItem.codigo,
          title: vtItem.nome,
          mainLocation: 'CDU',
          sectors: [],
          extension: '',
          additionalInfo: vtItem.info || '',
        });
      }
    });

    // Se a lista final estiver vazia e não houve mudanças em outros lugares, poderíamos retornar null,
    // mas aqui queremos GARANTIR que a categoria GERAL seja atualizada (ou limpa).

    let nextExamCategories = { ...currentExamCategories };
    const cats = nextExamCategories[VIEW_TYPE] || [];
    if (!cats.some(c => c.id === CAT_ID)) {
      nextExamCategories[VIEW_TYPE] = [...cats, { id: CAT_ID, name: "GERAL", color: "text-primary" }];
    }

    let nextExamData = { ...currentExamData };

    // ATENÇÃO: Substituímos TOTALMENTE a categoria GERAL no VIEW_TYPE CDU
    if (!nextExamData[VIEW_TYPE]) {
      nextExamData[VIEW_TYPE] = {} as any;
    }
    nextExamData[VIEW_TYPE][CAT_ID] = finalGeralExams;

    return { nextExamCategories, nextExamData };
  };

  const syncExamsFromValueTableWithItems = (providedItems?: ValueTableItem[]) => {
    const valueTableItems = providedItems || [];
    if (!providedItems) {
      const geralValueData = (valueTableData["GERAL"] || {}) as Record<string, ValueTableItem[]>;
      Object.values(geralValueData).forEach((items: ValueTableItem[]) => {
        valueTableItems.push(...items);
      });
    }

    const syncResult = calculateSyncExams(valueTableItems, examCategories, examData);
    if (syncResult) {
      setExamCategories(syncResult.nextExamCategories);
      setExamData(syncResult.nextExamData);
      setHasUnsavedChanges(true);
    }
    return syncResult;
  };

  // Professional functions
  const addProfessional = (viewType: string, categoryId: string, professional: Omit<Professional, "id">) => {
    const newProfessional: Professional = {
      ...professional,
      id: Date.now().toString(),
    };

    setProfessionalData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: [...(prev[viewType]?.[categoryId] || []), newProfessional],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const updateProfessional = (viewType: string, categoryId: string, professionalId: string, updates: Partial<Omit<Professional, "id">>) => {
    setProfessionalData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: (prev[viewType]?.[categoryId] || []).map(prof =>
          prof.id === professionalId ? { ...prof, ...updates } : prof
        ),
      },
    }));
    setHasUnsavedChanges(true);
  };

  const deleteProfessional = (viewType: string, categoryId: string, professionalId: string) => {
    setProfessionalData(prev => ({
      ...prev,
      [viewType]: {
        ...(prev[viewType] || {}),
        [categoryId]: (prev[viewType]?.[categoryId] || []).filter(prof => prof.id !== professionalId),
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Header tag functions
  const updateHeaderTag = (id: string, updates: Omit<HeaderTagInfo, "id" | "tag">) => {
    setHeaderTagData(prev =>
      prev.map(tag => tag.id === id ? { ...tag, ...updates } : tag)
    );
    setHasUnsavedChanges(true);
  };

  // Save/Load functions
  const saveToLocalStorage = (dataOverride?: any) => {
    const allData = {
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
      savedAt: new Date().toISOString(),
      ...dataOverride // Permite sobrescrever dados que acabaram de ser atualizados
    };
    localStorage.setItem('portalData', JSON.stringify(allData));
    setHasUnsavedChanges(false);
  };

  // User name functions
  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('portalUserName', name);
  };

  // Import/Export functions
  const exportAllData = (): string => {
    const allData = {
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
      infoTags, // NOVO
      infoData, // NOVO
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    return JSON.stringify(allData, null, 2);
  };

  const importAllData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);

      // Validar estrutura básica
      if (!data || typeof data !== 'object') {
        return false;
      }

      // Importar todos os dados
      if (data.scriptCategories) setScriptCategories(data.scriptCategories);
      if (data.scriptData) setScriptData(data.scriptData);
      if (data.examCategories) setExamCategories(data.examCategories);
      if (data.examData) setExamData(data.examData);
      if (data.contactCategories) setContactCategories(data.contactCategories);
      if (data.contactData) setContactData(data.contactData);
      if (data.valueTableCategories) setValueTableCategories(data.valueTableCategories);
      if (data.valueTableData) setValueTableData(data.valueTableData);
      if (data.professionalData) setProfessionalData(data.professionalData);
      if (data.officeData) setOfficeData(data.officeData);
      if (data.noticeData) setNoticeData(data.noticeData);
      if (data.headerTagData) setHeaderTagData(data.headerTagData);
      if (data.examDeliveryAttendants) setExamDeliveryAttendants(data.examDeliveryAttendants);
      if (data.recadoCategories) setRecadoCategories(data.recadoCategories);
      if (data.recadoData) setRecadoData(data.recadoData);
      if (data.infoTags) setInfoTags(data.infoTags); // NOVO
      if (data.infoData) setInfoData(data.infoData); // NOVO

      return true;
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
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
        infoTags, // NOVO
        infoData, // NOVO
        tussCodes, // Códigos TUSS
        addScriptCategory,
        updateScriptCategory,
        deleteScriptCategory,
        addScript,
        updateScript,
        deleteScript,
        addExamCategory,
        updateExamCategory,
        deleteExamCategory,
        addExam,
        updateExam,
        deleteExam,
        addContactCategory,
        updateContactCategory,
        deleteContactCategory,
        addContact,
        updateContact,
        deleteContact,
        addValueTableCategory,
        updateValueTableCategory,
        deleteValueTableCategory,
        addValueTable,
        updateValueTable,
        deleteValueTable,
        setValueTableCategoryItems,
        addProfessional,
        updateProfessional,
        deleteProfessional,
        addOffice,
        updateOffice,
        deleteOffice,
        addNotice,
        updateNotice,
        deleteNotice,
        updateHeaderTag,
        addExamDeliveryAttendant,
        updateExamDeliveryAttendant,
        deleteExamDeliveryAttendant,
        addRecadoCategory,
        updateRecadoCategory,
        deleteRecadoCategory,
        addRecadoItem,
        updateRecadoItem,
        deleteRecadoItem,
        addInfoTag, // NOVO
        updateInfoTag, // NOVO
        deleteInfoTag, // NOVO
        addInfoItem, // NOVO
        updateInfoItem, // NOVO
        deleteInfoItem, // NOVO
        importTussCodes, // TUSS
        clearTussCodes, // TUSS
        syncExamsFromValueTable: () => syncExamsFromValueTableWithItems(),
        exportAllData,
        importAllData,
        userName,
        setUserName,
        hasUnsavedChanges,
        saveToLocalStorage,
      }}
    >
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