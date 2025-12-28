import { useState, useEffect } from "react";
import { Plus, Settings, Edit, Trash2, Copy, Save, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecadoCategory, RecadoItem } from "@/types/data";
import { RecadoCategoryModal } from "@/components/modals/RecadoCategoryModal";
import { RecadoItemModal } from "@/components/modals/RecadoItemModal";
import { RecadoGeneratorModal } from "@/components/modals/RecadoGeneratorModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { RecadoCategoryFormData, RecadoItemFormData } from "@/schemas/recadoSchema";
import { useUserRoleContext } from "@/contexts/UserRoleContext";

interface RecadosContentProps {
  categories: RecadoCategory[];
  data: Record<string, RecadoItem[]>;
}

export const RecadosContent = ({ categories, data }: RecadosContentProps) => {
  const { canEdit } = useUserRoleContext();
  const canEditRecados = canEdit('recados');
  
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(RecadoItem & { categoryId: string }) | undefined>();
  const [editingCategory, setEditingCategory] = useState<RecadoCategory | undefined>();
  const [selectedItem, setSelectedItem] = useState<{ item: RecadoItem, category: RecadoCategory } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    recadoCategories,
    addRecadoCategory, 
    updateRecadoCategory, 
    deleteRecadoCategory, 
    addRecadoItem, 
    updateRecadoItem, 
    deleteRecadoItem, 
    hasUnsavedChanges, 
    saveToLocalStorage 
  } = useData();
  const { toast } = useToast();

  // Update activeCategory when categories change
  useEffect(() => {
    if (categories.length > 0 && (!activeCategory || !categories.find(cat => cat.id === activeCategory))) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const items = data[activeCategory] || [];
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Category Handlers ---
  const handleSaveCategory = async (formData: Omit<RecadoCategory, "id"> | RecadoCategory) => {
    if (!canEditRecados) return;
    setIsSaving(true);
    try {
      if ('id' in formData) {
        await updateRecadoCategory(formData);
        toast({ title: "Sucesso!", description: "Categoria atualizada com sucesso." });
      } else {
        await addRecadoCategory(formData);
        toast({ title: "Sucesso!", description: "Categoria criada com sucesso." });
      }
      setEditingCategory(undefined);
      setCategoryModalOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar a categoria.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCategory = (category: RecadoCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!canEditRecados) return;
    if (confirm("Tem certeza que deseja excluir esta categoria e todos os recados associados?")) {
      try {
        await deleteRecadoCategory(categoryId);
        toast({ title: "Sucesso!", description: "Categoria excluída." });
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao excluir a categoria.", variant: "destructive" });
      }
    }
  };

  // --- Item Handlers ---
  const handleSaveItem = async (formData: RecadoItemFormData) => {
    if (!canEditRecados) return;
    setIsSaving(true);
    try {
      const itemData = {
        title: formData.title,
        content: formData.content,
        fields: formData.fields,
      };

      if (editingItem) {
        // Se mudou de categoria, precisa remover da antiga e adicionar na nova
        if (editingItem.categoryId !== formData.categoryId) {
          await deleteRecadoItem(editingItem.categoryId, editingItem.id);
          await addRecadoItem(formData.categoryId, itemData);
        } else {
          // Mesma categoria, apenas atualiza
          await updateRecadoItem(formData.categoryId, editingItem.id, itemData);
        }
        toast({ title: "Sucesso!", description: "Item de recado atualizado com sucesso." });
      } else {
        await addRecadoItem(formData.categoryId, itemData);
        toast({ title: "Sucesso!", description: "Item de recado criado com sucesso." });
      }
      setEditingItem(undefined);
      setItemModalOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar o item de recado.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItem = (item: RecadoItem) => {
    setEditingItem({ ...item, categoryId: activeCategory });
    setItemModalOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!canEditRecados) return;
    if (confirm("Tem certeza que deseja excluir este item de recado?")) {
      try {
        await deleteRecadoItem(activeCategory, itemId);
        toast({ title: "Sucesso!", description: "Item excluído com sucesso." });
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao excluir o item.", variant: "destructive" });
      }
    }
  };

  const handleGenerateRecado = (item: RecadoItem) => {
    const category = categories.find(c => c.id === activeCategory);
    if (category) {
        setSelectedItem({ item, category });
        setGeneratorModalOpen(true);
    }
  };

  const handleCloseItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(undefined);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategory(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Recados Rápidos</h1>
              <p className="text-muted-foreground mt-1">
                Selecione um tema para gerar um recado pré-formatado
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
                title={hasUnsavedChanges ? "Salvar Alterações Locais" : "Tudo Salvo"}
                className="h-9 w-9"
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
              </Button>
              {canEditRecados && (
                <>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setEditingItem(undefined);
                      setItemModalOpen(true);
                    }}
                    disabled={categories.length === 0 || isSaving}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Novo Recado
                  </Button>
                  <Button variant="outline" onClick={() => setCategoryModalOpen(true)} disabled={isSaving}>
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
                    className={`whitespace-nowrap py-3 px-4 rounded-lg font-medium text-sm transition-colors duration-200 ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.title.toUpperCase()}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 border rounded-md px-3 bg-background max-w-md">
          <Input
            type="text"
            placeholder="Buscar recados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card 
                key={item.id} 
                className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full cursor-pointer group border-2 hover:border-primary/50"
                onClick={() => handleGenerateRecado(item)}
            >
              <CardHeader className="p-4 pb-3 bg-[#F0FDFA] flex-row items-center justify-between flex-shrink-0">
                <CardTitle className="text-base text-primary line-clamp-2 font-bold">{item.title}</CardTitle>
                <MessageCircle className="h-5 w-5 text-primary/70 group-hover:text-primary flex-shrink-0" />
              </CardHeader>

              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                {item.fields.length > 0 ? (
                    <div className="mt-0">
                        <p className="text-xs font-semibold text-foreground/70 mb-2">Campos Necessários:</p>
                        <div className="flex flex-wrap gap-1">
                            {item.fields.map(field => (
                                <span key={field} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                    {field.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Este recado não requer campos dinâmicos.</p>
                )}
              </CardContent>

              <div className="px-3 py-2 bg-muted/20 border-t flex justify-end items-center gap-2 mt-auto flex-shrink-0">
                {canEditRecados && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleEditItem(item); }}
                      className="h-8 w-8 hover:bg-background"
                      title="Editar"
                      disabled={isSaving}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                      className="h-8 w-8 text-destructive hover:bg-background hover:text-destructive"
                      title="Excluir"
                      disabled={isSaving}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleGenerateRecado(item); }}
                  className="h-8 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs"
                  title="Gerar Recado"
                >
                  Gerar
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            <p>{searchTerm ? "Nenhum recado encontrado." : categories.length === 0 ? "Crie uma categoria primeiro usando 'Gerenciar Categorias'." : "Nenhum recado nesta categoria. Clique em 'Novo Recado' para adicionar."}</p>
          </div>
        )}
        </div>
      </div>

      <RecadoItemModal
        open={itemModalOpen}
        onClose={handleCloseItemModal}
        onSave={handleSaveItem}
        categories={recadoCategories}
        editingItem={editingItem}
      />

      <RecadoCategoryModal
        isOpen={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        onSave={handleSaveCategory}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        categories={recadoCategories}
        category={editingCategory}
      />

      {selectedItem && (
        <RecadoGeneratorModal
            isOpen={generatorModalOpen}
            onClose={() => setGeneratorModalOpen(false)}
            item={selectedItem.item}
            category={selectedItem.category}
        />
      )}
    </div>
  );
};