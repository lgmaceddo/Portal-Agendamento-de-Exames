import { useState, useEffect } from "react";
import { Plus, Settings, Edit, Trash2, Copy, Eye, Save, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category, ScriptItem } from "@/types/data";
import { ScriptModal } from "@/components/modals/ScriptModal";
import { ScriptDetailsModal } from "@/components/modals/ScriptDetailsModal";
import { CategoryModal } from "@/components/modals/CategoryModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { ScriptFormData, CategoryFormData } from "@/schemas/scriptSchema";
import { replaceUserNamePlaceholders } from "@/lib/textReplacer";
import { getCategoryBadgeClasses } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";
import { useUserRoleContext } from "@/contexts/UserRoleContext";

interface ScriptsContentProps {
  viewType: string;
  categories: Category[];
  data: Record<string, ScriptItem[]>;
}

export const ScriptsContent = ({ viewType, categories, data }: ScriptsContentProps) => {
  const { canEdit } = useUserRoleContext();
  const canEditScripts = canEdit('scripts');

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<(ScriptItem & { categoryId: string }) | undefined>();
  const [viewingScript, setViewingScript] = useState<ScriptItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const { addScript, updateScript, deleteScript, addScriptCategory, updateScriptCategory, deleteScriptCategory, userName, hasUnsavedChanges, saveToLocalStorage } = useData();
  const { toast } = useToast();

  // Update activeCategory when viewType or categories change
  useEffect(() => {
    if (categories.length > 0 && (!activeCategory || !categories.find(cat => cat.id === activeCategory))) {
      setActiveCategory(categories[0].id);
    }
  }, [viewType, categories, activeCategory]);

  const items = data[activeCategory] || [];
  const filteredItems = items
    .filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Scripts com ordem definida vêm primeiro, ordenados numericamente
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // Scripts com ordem vêm antes dos sem ordem
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      // Scripts sem ordem são ordenados alfabeticamente
      return a.title.localeCompare(b.title, 'pt-BR');
    });

  const handleSaveScript = (formData: ScriptFormData) => {
    const scriptData: ScriptItem = {
      id: editingScript?.id || `s-${Date.now()}`,
      title: formData.title,
      content: formData.content,
      order: formData.order,
    };

    if (editingScript) {
      // Se mudou de categoria, precisa remover da antiga e adicionar na nova
      if (editingScript.categoryId !== formData.categoryId) {
        deleteScript(viewType, editingScript.categoryId, editingScript.id);
        addScript(viewType, formData.categoryId, scriptData);
      } else {
        // Mesma categoria, apenas atualiza
        updateScript(viewType, formData.categoryId, editingScript.id, scriptData);
      }
    } else {
      addScript(viewType, formData.categoryId, scriptData);
    }
    setEditingScript(undefined);
  };

  const handleEditScript = (script: ScriptItem) => {
    setEditingScript({ ...script, categoryId: activeCategory });
    setScriptModalOpen(true);
  };

  const handleDeleteScript = (scriptId: string) => {
    if (confirm("Tem certeza que deseja excluir este script?")) {
      deleteScript(viewType, activeCategory, scriptId);
      toast({
        title: "Sucesso!",
        description: "Script excluído com sucesso.",
      });
    }
  };

  const handleCopyScript = (content: string) => {
    const processedContent = replaceUserNamePlaceholders(content, userName);
    navigator.clipboard.writeText(processedContent);
    toast({
      title: "Copiado!",
      description: "Script copiado.",
      variant: "compact",
      duration: 1000,
    });
  };

  const handleViewScript = (script: ScriptItem) => {
    setViewingScript(script);
    setDetailsModalOpen(true);
  };

  const handleAddCategory = (formData: CategoryFormData) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: formData.name,
      color: formData.color,
    };
    addScriptCategory(viewType, newCategory);
    if (categories.length === 0) {
      setActiveCategory(newCategory.id);
    }
  };

  const handleUpdateCategory = (categoryId: string, updates: Partial<Category>) => {
    updateScriptCategory(viewType, categoryId, updates);
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteScriptCategory(viewType, categoryId);
    if (activeCategory === categoryId && categories.length > 1) {
      const remainingCategories = categories.filter(cat => cat.id !== categoryId);
      if (remainingCategories.length > 0) {
        setActiveCategory(remainingCategories[0].id);
      }
    }
  };

  const getFirstTwoLines = (content: string): string => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    return lines.slice(0, 2).join('\n');
  };

  const activeCategoryInfo = categories.find(cat => cat.id === activeCategory);
  const categoryClasses = activeCategoryInfo ? getCategoryBadgeClasses(activeCategoryInfo.color) : 'bg-muted text-muted-foreground';
  const categoryColorText = categoryClasses.split(' ').find(c => c.startsWith('text-')) || 'text-foreground';
  const categoryColorBg = categoryClasses.split(' ').find(c => c.startsWith('bg-')) || 'bg-muted/20';


  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">{viewType} - Scripts</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie scripts de atendimento para {viewType}
              </p>
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
                title={hasUnsavedChanges ? "Salvar Alterações" : "Tudo Salvo"}
                className="h-9 w-9"
              >
                <Save className="h-4 w-4" />
              </Button>
              {canEditScripts && (
                <>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setEditingScript(undefined);
                      setScriptModalOpen(true);
                    }}
                    disabled={categories.length === 0}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Novo Script
                  </Button>
                  <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
                    <Settings className="h-5 w-5 mr-2" />
                    Gerenciar Categorias
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
            placeholder="Buscar scripts..."
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "relative overflow-hidden flex flex-col cursor-pointer group transition-all duration-300 border border-border/50 hover:shadow-xl hover:border-primary/40 bg-card",
                )}
                onClick={() => handleCopyScript(item.content)}
              >
                <CardContent className="p-0 flex flex-col">
                  {/* Header Section - Apenas Título com Número Discreto */}
                  <div className={cn("p-3 flex items-center justify-center transition-colors duration-300 min-h-[70px]", categoryColorBg)}>
                    <div className="flex items-center gap-2 w-full justify-center">
                      {item.order && (
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold">
                          {item.order}
                        </span>
                      )}
                      <h3 className="font-bold text-xs text-foreground line-clamp-2 text-center group-hover:text-primary transition-colors leading-tight uppercase tracking-tight flex-1">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Footer Actions - Minimalista */}
                  <div className="px-2 py-1.5 bg-muted/10 border-t flex justify-between items-center gap-1 mt-auto">
                    <div className="flex gap-1">
                      {canEditScripts && (
                        <div className="flex bg-muted/30 rounded-md p-0.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleEditScript(item); }}
                            className="h-6 w-6 text-muted-foreground hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleDeleteScript(item.id); }}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleViewScript(item); }}
                      className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/5 font-medium"
                    >
                      Ver Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              <p>{searchTerm ? "Nenhum script encontrado." : categories.length === 0 ? "Crie uma categoria primeiro usando 'Gerenciar Categorias'." : "Nenhum script nesta categoria. Clique em 'Novo Script' para adicionar."}</p>
            </div>
          )}
        </div>
      </div>

      <ScriptModal
        open={scriptModalOpen}
        onClose={() => {
          setScriptModalOpen(false);
          setEditingScript(undefined);
        }}
        onSave={handleSaveScript}
        categories={categories}
        editingScript={editingScript}
      />

      {viewingScript && (
        <ScriptDetailsModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setViewingScript(null);
          }}
          script={viewingScript}
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