import { useState } from "react";
import { Plus, X, Save, Search, Edit, Trash2, Copy, Stethoscope } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Professional } from "@/types/data";
import { ProfessionalModal } from "@/components/modals/ProfessionalModal";
import { ProfessionalDetailsModal } from "@/components/modals/ProfessionalDetailsModal";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfissionaisContentProps {
  data: Professional[];
}

export const ProfissionaisContent = ({ data }: ProfissionaisContentProps) => {
  const { canEdit } = useUserRoleContext();
  const canEditProfissionais = canEdit('profissionais');

  const { addProfessional, updateProfessional, deleteProfessional, hasUnsavedChanges, saveToLocalStorage } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // State for Modals
  const [isNewProfessionalModalOpen, setIsNewProfessionalModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deletingProfessionalId, setDeletingProfessionalId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // State for Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingProfessional, setViewingProfessional] = useState<Professional | null>(null);

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

  const handleCopySingle = (prof: Professional) => {
    const fittingsText = prof.fittings.allowed
      ? `Sim (Máx: ${prof.fittings.max}${prof.fittings.details ? ` - ${prof.fittings.details}` : ''})`
      : 'Não';

    const text = `*${prof.name.toUpperCase()}*\nEspecialidade: ${prof.specialty}\nIdade: ${prof.ageRange}\nAceita Encaixe: ${fittingsText}${prof.generalObs ? `\nObservações: ${prof.generalObs}` : ''}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Informações do profissional copiadas.",
    });
  };

  const handleCopySelected = () => {
    const selectedList = filteredData.filter(prof => selectedItems.has(prof.id));
    if (selectedList.length === 0) return;

    const text = selectedList.map(prof => {
      const fittingsText = prof.fittings.allowed
        ? `Sim (Máx: ${prof.fittings.max}${prof.fittings.details ? ` - ${prof.fittings.details}` : ''})`
        : 'Não';

      return `*${prof.name.toUpperCase()}*\nEspecialidade: ${prof.specialty}\nIdade: ${prof.ageRange}\nAceita Encaixe: ${fittingsText}${prof.generalObs ? `\nObservações: ${prof.generalObs}` : ''}`;
    }).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n');

    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${selectedList.length} profissionais copiados.`,
    });
  };

  const handleEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsNewProfessionalModalOpen(true);
  };

  const handleSaveProfessional = async (professionalData: Omit<Professional, "id">) => {
    if (!canEditProfissionais) return;
    setIsSaving(true);
    try {
      if (editingProfessional) {
        await updateProfessional("GERAL", "prof-cat-1", editingProfessional.id, professionalData);
        toast({ title: "Sucesso", description: "Profissional atualizado com sucesso!" });
        setEditingProfessional(null);
      } else {
        await addProfessional("GERAL", "prof-cat-1", professionalData);
        toast({ title: "Sucesso", description: "Profissional adicionado com sucesso!" });
      }
      setIsNewProfessionalModalOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar o profissional.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfessional = (professionalId: string) => {
    if (!canEditProfissionais) return;
    setDeletingProfessionalId(professionalId);
  };

  const confirmDelete = async () => {
    if (!canEditProfissionais || !deletingProfessionalId) return;
    setIsSaving(true);
    try {
      await deleteProfessional("GERAL", "prof-cat-1", deletingProfessionalId);
      toast({ title: "Sucesso", description: "Profissional excluído com sucesso!" });
      setDeletingProfessionalId(null);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao excluir o profissional.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsNewProfessionalModalOpen(false);
    setEditingProfessional(null);
  };

  const handleViewDetails = (prof: Professional) => {
    setViewingProfessional(prof);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingProfessional(null);
  };

  const filteredData = data
    .filter(
      (prof) =>
        prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.ageRange.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.generalObs.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profissionais</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Gerencie profissionais, especialidades e regras de agendamento.
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

            {canEditProfissionais && (
              <Button
                onClick={() => setIsNewProfessionalModalOpen(true)}
                className="h-10 bg-primary hover:bg-primary/90"
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Profissional
              </Button>
            )}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar profissionais..."
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

      {selectedItems.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
              {selectedItems.size}
            </div>
            <span className="text-sm font-medium text-primary">profissionais selecionados</span>
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
                    checked={filteredData.length > 0 && filteredData.every(p => selectedItems.has(p.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newSet = new Set(selectedItems);
                        filteredData.forEach(p => newSet.add(p.id));
                        setSelectedItems(newSet);
                      } else {
                        const newSet = new Set(selectedItems);
                        filteredData.forEach(p => newSet.delete(p.id));
                        setSelectedItems(newSet);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Especialidade
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Idade que Atende
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Aceita Encaixe
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Observações
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length > 0 ? (
                filteredData.map((prof) => (
                  <tr
                    key={prof.id}
                    onClick={() => handleViewDetails(prof)}
                    className={cn(
                      "hover:bg-muted/30 transition-colors group cursor-pointer",
                      selectedItems.has(prof.id) && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded cursor-pointer"
                        checked={selectedItems.has(prof.id)}
                        onChange={() => toggleSelection(prof.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm text-foreground uppercase">{prof.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase">
                        {prof.specialty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-600 border-purple-100 font-medium">
                        {prof.ageRange || 'Não especificado'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {prof.fittings.allowed ? (
                        <div className="flex flex-col gap-1">
                          <Badge className="text-[10px] bg-green-50 text-green-700 border-green-200 font-bold w-fit">
                            ✓ Sim (Máx: {prof.fittings.max})
                          </Badge>
                          {prof.fittings.details && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[10px] text-muted-foreground italic cursor-help">Ver regras</span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-xs">{prof.fittings.details}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200 font-bold">
                          ✗ Não
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {prof.generalObs ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                {prof.generalObs}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md p-4 bg-popover text-popover-foreground border shadow-lg">
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">{prof.generalObs}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/30 italic">Sem observações</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => handleCopySingle(prof)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copiar Informações</TooltipContent>
                          </Tooltip>

                          {canEditProfissionais && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" onClick={() => handleEditProfessional(prof)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" onClick={() => handleDeleteProfessional(prof.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
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
                  <td colSpan={6} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 opacity-20" />
                      <p className="text-sm">
                        {searchTerm ? "Nenhum profissional encontrado." : "Nenhum profissional cadastrado."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProfessionalModal
        isOpen={isNewProfessionalModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProfessional}
        professional={editingProfessional}
      />

      {viewingProfessional && (
        <ProfessionalDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          professional={viewingProfessional}
        />
      )}

      <AlertDialog open={!!deletingProfessionalId} onOpenChange={() => setDeletingProfessionalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isSaving}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};