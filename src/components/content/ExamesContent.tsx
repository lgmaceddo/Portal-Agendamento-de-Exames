import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Settings, RefreshCw, Copy, MapPin, Phone, Info, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, ExamItem } from "@/types/data";
import { ExamModal } from "@/components/modals/ExamModal";
import { CategoryModal } from "@/components/modals/CategoryModal";
import { ExamItemDetailsModal } from "@/components/modals/ExamItemDetailsModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExamFormData, CategoryFormData } from "@/schemas/examSchema";

interface ExamesContentProps {
  viewType: string;
  categories: Category[];
  data: Record<string, ExamItem[]>;
}

export const ExamesContent = ({ viewType, categories, data }: ExamesContentProps) => {
  const { canEdit } = useUserRoleContext();
  const canEditExams = canEdit('exames');

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingExam, setViewingExam] = useState<ExamItem | null>(null);
  const [editingExam, setEditingExam] = useState<(ExamItem & { categoryId: string }) | undefined>();
  const [isSaving, setIsSaving] = useState(false);


  const {
    addExam,
    updateExam,
    deleteExam,
    addExamCategory,
    updateExamCategory,
    deleteExamCategory,
    hasUnsavedChanges,
    saveToLocalStorage,
    syncExamsFromValueTable
  } = useData();
  const { toast } = useToast();

  // Monitora mudanças nas categorias
  useEffect(() => {
    if (categories.length > 0) {
      if (!activeCategory || !categories.find(c => c.id === activeCategory)) {
        setActiveCategory(categories[0].id);
      }
    }
  }, [categories, activeCategory]);

  const allItems = searchTerm
    ? Object.values(data).flat()
    : (data[activeCategory] || []);

  const filteredItems = allItems
    .filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleEdit = (exam: ExamItem) => {
    setEditingExam({ ...exam, categoryId: activeCategory });
    setExamModalOpen(true);
  };

  const handleView = (exam: ExamItem) => {
    setViewingExam(exam);
    setDetailsModalOpen(true);
  };

  const handleDelete = async (exam: ExamItem) => {
    if (!canEditExams) return;
    if (confirm(`Deseja realmente excluir "${exam.title}"?`)) {
      try {
        await deleteExam(viewType, activeCategory, exam.id);
        toast({
          title: "Exame excluído",
          description: "O exame foi removido com sucesso.",
        });
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao excluir o exame.", variant: "destructive" });
      }
    }
  };

  const handleSaveExam = async (formData: ExamFormData) => {
    if (!canEditExams) return;
    setIsSaving(true);
    try {
      const targetViewType = formData.mainLocation;
      const examData = {
        code: formData.code || "",
        title: formData.title,
        mainLocation: formData.mainLocation,
        sectors: formData.sectors,
        extension: formData.extension,
        additionalInfo: formData.additionalInfo || "",
        rules: formData.rules || "",
      };

      if (editingExam) {
        if (editingExam.categoryId !== formData.categoryId || editingExam.mainLocation !== targetViewType) {
          // Se mudou de categoria ou viewType, deleta da antiga e adiciona na nova
          await deleteExam(editingExam.mainLocation, editingExam.categoryId, editingExam.id);
          await addExam(targetViewType, formData.categoryId, examData);
        } else {
          // Apenas atualiza os dados na mesma categoria/viewType
          await updateExam(targetViewType, formData.categoryId, editingExam.id, examData);
        }
        toast({ title: "Sucesso!", description: "Exame atualizado com sucesso." });
      } else {
        await addExam(targetViewType, formData.categoryId, examData);
        toast({ title: "Sucesso!", description: "Exame criado com sucesso." });
      }
      setEditingExam(undefined);
      setExamModalOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar o exame.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySingle = (exam: ExamItem) => {
    const sectors = exam.sectors || [];
    const text = `*${exam.title.toUpperCase()}*\nLocal: ${exam.mainLocation}\nSetor: ${sectors.join(', ')}\nRamal: ${exam.extension}${exam.additionalInfo ? `\nInfo: ${exam.additionalInfo}` : ''}${exam.rules ? `\nRegras: ${exam.rules}` : ''}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Informações do exame copiadas.",
    });
  };

  const handleCopySelected = () => {
    const selectedExams = filteredItems.filter(item => selectedItems.has(item.id));
    if (selectedExams.length === 0) return;

    const text = selectedExams.map(exam => {
      const sectors = exam.sectors || [];
      return `*${exam.title.toUpperCase()}*\nLocal: ${exam.mainLocation}\nSetor: ${sectors.join(', ')}\nRamal: ${exam.extension}${exam.additionalInfo ? `\nInfo: ${exam.additionalInfo}` : ''}${exam.rules ? `\nRegras: ${exam.rules}` : ''}`;
    }).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n');

    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${selectedExams.length} exames copiados para a área de transferência.`,
    });
  };

  const handleAddCategory = async (formData: CategoryFormData) => {
    if (!canEditExams) return;
    try {
      await addExamCategory(viewType, { name: formData.name, color: formData.color });
      toast({ title: "Sucesso!", description: "Categoria criada com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao criar categoria.", variant: "destructive" });
    }
  };

  const handleUpdateCategory = async (categoryId: string, updates: Partial<Category>) => {
    if (!canEditExams) return;
    try {
      await updateExamCategory(viewType, categoryId, updates);
      toast({ title: "Sucesso!", description: "Categoria atualizada com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao atualizar categoria.", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!canEditExams) return;
    if (confirm("Tem certeza que deseja excluir esta categoria? Todos os exames associados serão perdidos.")) {
      try {
        await deleteExamCategory(viewType, categoryId);
        toast({ title: "Sucesso!", description: "Categoria excluída com sucesso." });
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao excluir categoria.", variant: "destructive" });
      }
    }
  };

  const handleSync = async () => {
    if (!canEditExams) return;
    setIsSaving(true);
    try {
      await syncExamsFromValueTable();
    } catch (error) {
      toast({ title: "Erro", description: "Falha na sincronização.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Exames e Procedimentos</h1>
              <p className="text-muted-foreground mt-1">Gerencie as informações dos exames</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  saveToLocalStorage();
                  toast({
                    title: "Dados salvos",
                    description: "Todas as alterações foram salvas com sucesso!",
                  });
                }}
                size="icon"
                variant={hasUnsavedChanges ? "default" : "outline"}
                title={hasUnsavedChanges ? "Salvar Alterações Locais" : "Tudo Salvo"}
                className="h-9 w-9"
              >
                <Save className="h-4 w-4" />
              </Button>
              {canEditExams && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSync}
                    disabled={isSaving}
                  >
                    <RefreshCw className={cn("h-5 w-5 mr-2 text-teal-600", isSaving && "animate-spin")} />
                    Sincronizar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCategoryModalOpen(true)}
                    disabled={isSaving}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Categorias
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setEditingExam(undefined);
                      setExamModalOpen(true);
                    }}
                    disabled={categories.length === 0 || isSaving}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Novo Exame
                  </Button>
                </>
              )}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="border-b border-border">
              <nav className="flex flex-wrap gap-2" aria-label="Tabs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap py-3 px-4 rounded-lg font-medium text-sm transition-colors duration-200 ${activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    {cat.name.toUpperCase()}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border rounded-md px-3 bg-card max-w-md mt-4">
          <Input
            type="text"
            placeholder="Buscar nome do exame..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-card"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-border">
              <thead className="bg-[#ECFDF5]">
                <tr>
                  <th className="px-4 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(filteredItems.map((item) => item.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                      checked={
                        filteredItems.length > 0 &&
                        filteredItems.every((item) => selectedItems.has(item.id))
                      }
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Nome do Exame
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Local
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Setor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Ramal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Info
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition-colors cursor-pointer ${selectedItems.has(item.id)
                        ? "bg-primary/5"
                        : "hover:bg-muted/30"
                        }`}
                      onClick={() => handleView(item)}
                    >
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground text-sm uppercase">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] uppercase font-bold border",
                            item.mainLocation === "CDU" && "bg-teal-50 text-teal-800 border-teal-200",
                            item.mainLocation === "HOSPITAL" && "bg-orange-50 text-orange-600 border-orange-200",
                            item.mainLocation === "EXTERNO" && "bg-red-50 text-red-800 border-red-200"
                          )}
                        >
                          {item.mainLocation}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.sectors.map((sector, idx) => {
                            const isSaudeDaMulher = sector.toLowerCase().includes('saúde da mulher') || sector.toLowerCase().includes('saude da mulher');
                            return (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={cn(
                                  "text-[10px] py-0 h-4 px-1.5 border-border/50 font-medium whitespace-nowrap",
                                  isSaudeDaMulher ? "bg-red-50 text-red-600 border-red-200" : "bg-muted/40"
                                )}
                              >
                                {sector}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2 text-primary/60" />
                          {item.extension}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.additionalInfo ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center text-muted-foreground max-w-[200px]">
                                  <Info className="h-3.5 w-3.5 mr-2 text-primary/60 shrink-0" />
                                  <span className="text-xs truncate">{item.additionalInfo}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs p-3">
                                <p className="text-xs leading-relaxed">{item.additionalInfo}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground/30 text-[10px] italic">Sem informações</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-0.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleView(item)}
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Visualizar</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleCopySingle(item)}
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copiar</TooltipContent>
                            </Tooltip>
                            {canEditExams && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleEdit(item)}
                                      className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Editar</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleDelete(item)}
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Excluir</TooltipContent>
                                </Tooltip>
                              </>
                            )}
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Search className="h-8 w-8 text-muted-foreground/20" />
                        <p>{searchTerm ? "Nenhum exame encontrado." : "Nenhum exame cadastrado nesta categoria."}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ExamModal
        open={examModalOpen}
        onClose={() => {
          setExamModalOpen(false);
          setEditingExam(undefined);
        }}
        onSave={handleSaveExam}
        categories={categories}
        editingExam={editingExam}
      />

      {viewingExam && (
        <ExamItemDetailsModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setViewingExam(null);
          }}
          exam={viewingExam}
        />
      )}

      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onAdd={handleAddCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
        categories={categories}
      />
    </div>
  );
};