import { useState, useEffect } from "react";
import { Plus, Settings, Edit, Trash2, Eye, Save, X, Search, FileText, Download, Clock, Info, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InfoTag, InfoItem } from "@/types/data";
import { InfoTagModal } from "@/components/modals/InfoTagModal";
import { InfoItemModal } from "@/components/modals/InfoItemModal";
import { InfoDetailsModal } from "@/components/modals/InfoDetailsModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { InfoItemFormData } from "@/schemas/infoSchema";
import { getCategoryBadgeClasses } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InformacoesContentProps {
  tags: InfoTag[];
  data: Record<string, InfoItem[]>;
}

export const InformacoesContent = ({ tags, data }: InformacoesContentProps) => {
  const { canEdit } = useUserRoleContext();
  const canEditInfo = canEdit('informacoes');

  const [activeTagId, setActiveTagId] = useState(tags[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InfoItem | undefined>();
  const [editingTag, setEditingTag] = useState<InfoTag | undefined>();
  const [viewingItem, setViewingItem] = useState<{ item: InfoItem, tag: InfoTag | undefined } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    addInfoTag,
    updateInfoTag,
    deleteInfoTag,
    addInfoItem,
    updateInfoItem,
    deleteInfoItem,
    hasUnsavedChanges,
    saveToLocalStorage
  } = useData();
  const { toast } = useToast();

  useEffect(() => {
    if (tags.length > 0 && (!activeTagId || !tags.find(tag => tag.id === activeTagId))) {
      setActiveTagId(tags[0].id);
    }
  }, [tags, activeTagId]);

  // Busca global em todas as categorias quando há um termo de busca
  const getAllFilteredItems = () => {
    if (!searchTerm) {
      return (data[activeTagId] || []).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    }

    const allItems: InfoItem[] = [];
    Object.values(data).forEach(tagItems => {
      allItems.push(...tagItems);
    });

    return allItems
      .filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  };

  const filteredItems = getAllFilteredItems();

  const getTagById = (tagId: string) => tags.find(t => t.id === tagId);

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

  const handleCopySingle = (item: InfoItem) => {
    const text = `*${item.title.toUpperCase()}*\n\n${item.content}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Informação copiada para a área de transferência.",
    });
  };

  const handleCopySelected = () => {
    const selectedList = filteredItems.filter(item => selectedItems.has(item.id));
    if (selectedList.length === 0) return;

    const text = selectedList.map(item => {
      return `*${item.title.toUpperCase()}*\n\n${item.content}`;
    }).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n');

    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${selectedList.length} itens copiados.`,
    });
  };

  const handleSaveItem = async (formData: InfoItemFormData & { id?: string }) => {
    if (!canEditInfo) return;
    setIsSaving(true);
    try {
      const itemData: Omit<InfoItem, "id" | "date" | "tagId"> & { tagId: string } = {
        title: formData.title,
        content: formData.content,
        tagId: formData.tagId,
        attachments: formData.attachments || [],
      };

      if (formData.id) {
        const currentItem = Object.values(data).flat().find(i => i.id === formData.id);
        if (currentItem && currentItem.tagId !== formData.tagId) {
          // Se mudou de tag, deleta o antigo e insere o novo (para garantir a consistência do Supabase)
          await deleteInfoItem(currentItem.id, currentItem.tagId);
          await addInfoItem(itemData);
        } else {
          await updateInfoItem({ ...currentItem!, ...itemData, id: formData.id });
        }
        toast({ title: "Sucesso!", description: "Informação atualizada com sucesso." });
      } else {
        await addInfoItem(itemData);
        toast({ title: "Sucesso!", description: "Informação criada com sucesso." });
      }
      setEditingItem(undefined);
      setItemModalOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar a informação.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItem = (item: InfoItem) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleDeleteItem = async (itemId: string, tagId: string) => {
    if (!canEditInfo) return;
    if (confirm("Tem certeza que deseja excluir esta informação?")) {
      try {
        await deleteInfoItem(itemId, tagId);
        toast({
          title: "Sucesso!",
          description: "Informação excluída com sucesso.",
        });
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao excluir a informação.", variant: "destructive" });
      }
    }
  };

  const handleViewDetails = (item: InfoItem) => {
    const tag = getTagById(item.tagId);
    setViewingItem({ item, tag });
    setDetailsModalOpen(true);
  };

  const handleSaveTag = async (formData: Omit<InfoTag, "id"> | InfoTag) => {
    if (!canEditInfo) return;
    setIsSaving(true);
    try {
      if ('id' in formData) {
        await updateInfoTag(formData);
        toast({ title: "Sucesso!", description: "Etiqueta atualizada." });
      } else {
        await addInfoTag(formData);
        toast({ title: "Sucesso!", description: "Etiqueta criada." });
      }
      setEditingTag(undefined);
      setTagModalOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar a etiqueta.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTag = (tag: InfoTag) => {
    setEditingTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!canEditInfo) return;
    if (confirm("ATENÇÃO! Excluir esta etiqueta removerá TODOS os itens de informação associados a ela. Continuar?")) {
      try {
        await deleteInfoTag(tagId);
        toast({ title: "Sucesso!", description: "Etiqueta e itens associados excluídos." });
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao excluir a etiqueta.", variant: "destructive" });
      }
    }
  };

  const handleCloseItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(undefined);
  };

  const handleCloseTagModal = () => {
    setTagModalOpen(false);
    setEditingTag(undefined);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setViewingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Anotações</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Regras, procedimentos e informações importantes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={hasUnsavedChanges ? "default" : "outline"}
              size="icon"
              onClick={() => {
                saveToLocalStorage();
                toast({ title: "Dados salvos", description: "As alterações foram gravadas." });
              }}
              className={cn("h-10 w-10", hasUnsavedChanges && "bg-blue-600 hover:bg-blue-700")}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
            </Button>

            {canEditInfo && (
              <>
                <Button
                  onClick={() => setTagModalOpen(true)}
                  variant="outline"
                  className="h-10 border-border/80"
                  disabled={isSaving}
                >
                  <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                  Etiquetas
                </Button>
                <Button
                  onClick={() => {
                    setEditingItem(undefined);
                    setItemModalOpen(true);
                  }}
                  className="h-10 bg-primary hover:bg-primary/90"
                  disabled={tags.length === 0 || isSaving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Regra
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex overflow-x-auto pb-2 md:pb-0 gap-1 custom-scrollbar">
            {tags.map((tag) => {
              const isActive = activeTagId === tag.id;
              const tagClasses = getCategoryBadgeClasses(tag.color);
              const textColorClass = tagClasses.split(' ').find(c => c.startsWith('text-')) || '';

              return (
                <button
                  key={tag.id}
                  onClick={() => setActiveTagId(tag.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border-2",
                    isActive
                      ? "bg-primary border-primary text-primary-foreground shadow-md"
                      : cn("bg-transparent border-transparent text-muted-foreground hover:bg-muted", textColorClass)
                  )}
                >
                  {tag.name.toUpperCase()}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar regras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-muted/30 border-border/60 focus:bg-background transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedItems.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
              {selectedItems.size}
            </div>
            <span className="text-sm font-medium text-primary">itens selecionados</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleCopySelected} className="bg-primary hover:bg-primary/90">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Selecionados
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedItems(new Set())} className="text-primary hover:bg-primary/10">
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    checked={filteredItems.length > 0 && filteredItems.every(i => selectedItems.has(i.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newSet = new Set(selectedItems);
                        filteredItems.forEach(i => newSet.add(i.id));
                        setSelectedItems(newSet);
                      } else {
                        const newSet = new Set(selectedItems);
                        filteredItems.forEach(i => newSet.delete(i.id));
                        setSelectedItems(newSet);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Título da Regra
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Etiqueta
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Conteúdo
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Anexos
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const tag = getTagById(item.tagId);
                  const tagClasses = tag ? getCategoryBadgeClasses(tag.color) : 'bg-muted text-muted-foreground';

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors cursor-pointer group",
                        selectedItems.has(item.id) && "bg-primary/5 hover:bg-primary/10"
                      )}
                      onClick={() => handleViewDetails(item)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded cursor-pointer"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground text-sm uppercase">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={cn("text-[10px] font-bold uppercase", tagClasses)}>
                          {tag?.name || 'GERAL'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                                {item.content}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md p-4 bg-popover text-popover-foreground border shadow-lg">
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">{item.content}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                      <td className="px-6 py-4">
                        {item.attachments && item.attachments.length > 0 ? (
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1 w-fit">
                            <Download className="h-3 w-3" />
                            {item.attachments.length}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/30 italic">Nenhum</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => handleViewDetails(item)} className="h-8 w-8 text-primary hover:bg-primary/10">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Visualizar</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => handleCopySingle(item)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copiar Texto</TooltipContent>
                            </Tooltip>

                            {canEditInfo && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" onClick={() => handleEditItem(item)} className="h-8 w-8 text-blue-600 hover:bg-blue-50" disabled={isSaving}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Editar</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item.id, item.tagId)} className="h-8 w-8 text-destructive hover:bg-destructive/10" disabled={isSaving}>
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 opacity-20" />
                      <p className="text-sm">
                        {searchTerm ? "Nenhuma informação encontrada." : "Nenhuma informação nesta etiqueta."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InfoItemModal
        open={itemModalOpen}
        onClose={handleCloseItemModal}
        onSave={handleSaveItem}
        tags={tags}
        editingItem={editingItem}
      />

      <InfoTagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        onSave={handleSaveTag}
        onEdit={handleEditTag}
        onDelete={handleDeleteTag}
        tags={tags}
        editingTag={editingTag}
      />

      {viewingItem && (
        <InfoDetailsModal
          isOpen={detailsModalOpen}
          onClose={handleCloseDetailsModal}
          item={viewingItem.item}
          tag={viewingItem.tag}
        />
      )}
    </div>
  );
};