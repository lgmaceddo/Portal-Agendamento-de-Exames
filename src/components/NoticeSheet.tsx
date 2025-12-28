import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Info, Pencil, Trash2, AlertTriangle, MessageSquare, Settings, BookOpen, Zap, Plus } from "lucide-react";
import { Notice, NoticeTag } from "@/types/notice";
import { NoticeModal } from "./modals/NoticeModal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NoticeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
  onAdd: (notice: Omit<Notice, "id" | "date">) => void;
  onUpdate: (notice: Notice) => void;
  onDelete: (id: string) => void;
}

const getTagClasses = (tag: NoticeTag) => {
  switch (tag) {
    case "URGENTE":
      return {
        bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
        text: "text-red-700 dark:text-red-400",
        icon: AlertTriangle,
      };
    case "FLUXO":
      return {
        bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-400",
        icon: Settings,
      };
    case "SISTEMA":
      return {
        bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
        text: "text-purple-700 dark:text-purple-400",
        icon: Zap,
      };
    case "TREINAMENTO":
      return {
        bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-700 dark:text-yellow-400",
        icon: BookOpen,
      };
    case "GERAL":
    default:
      return {
        bg: "bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/50",
        text: "text-primary dark:text-primary-foreground",
        icon: MessageSquare,
      };
  }
};

export const NoticeSheet = ({
  isOpen,
  onClose,
  notices,
  onAdd,
  onUpdate,
  onDelete,
}: NoticeSheetProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | undefined>();
  const { toast } = useToast();

  const handleAdd = () => {
    setEditingNotice(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este aviso?")) {
      onDelete(id);
      toast({
        title: "Aviso excluído",
        description: "O aviso foi removido com sucesso.",
      });
    }
  };

  const handleSave = (noticeData: Omit<Notice, "id" | "date"> & { id?: string, date?: string }) => {
    if (noticeData.id) {
      onUpdate(noticeData as Notice);
      toast({
        title: "Aviso atualizado",
        description: "O aviso foi atualizado com sucesso.",
      });
    } else {
      // Adiciona a data se for novo
      const currentDate = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      onAdd({ ...noticeData, date: currentDate } as Omit<Notice, "id">);
      toast({
        title: "Aviso criado",
        description: "O aviso foi criado com sucesso.",
      });
    }
    setIsModalOpen(false);
    setEditingNotice(undefined);
  };

  // Ordena os avisos: URGENTE primeiro, depois por data (mais recente primeiro)
  const sortedNotices = [...notices].sort((a, b) => {
    if (a.tag === "URGENTE" && b.tag !== "URGENTE") return -1;
    if (a.tag !== "URGENTE" && b.tag === "URGENTE") return 1;
    
    // Comparação de data simples (string)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="text-primary text-2xl font-bold">Mural de Avisos</SheetTitle>
            <p className="text-sm text-muted-foreground">Comunique atualizações importantes para a equipe.</p>
          </SheetHeader>

          <div className="mt-6">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-semibold text-primary border-primary/50 hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Aviso
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 bg-muted/30 rounded-lg mt-2">
                  <Button
                    onClick={handleAdd}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    + Abrir Formulário de Aviso
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)] mt-6">
            <div className="space-y-4 pr-4">
              {sortedNotices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum aviso cadastrado</p>
                </div>
              ) : (
                sortedNotices.map((notice) => {
                  const { bg, text, icon: Icon } = getTagClasses(notice.tag);
                  return (
                    <div
                      key={notice.id}
                      className={cn(
                        "bg-card border rounded-lg p-4 transition-shadow duration-200",
                        bg,
                        notice.tag === "URGENTE" ? "shadow-lg shadow-red-500/20 border-red-500/50" : "hover:shadow-md"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", text, bg)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={cn("font-bold text-lg", text)}>
                              {notice.title}
                            </h4>
                            <Badge 
                                className={cn(
                                    "text-xs font-semibold uppercase px-2 py-0.5",
                                    notice.tag === "URGENTE" ? "bg-red-600 text-white" : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                                )}
                            >
                                {notice.tag}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Publicado em: {notice.date}
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {notice.content}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                            onClick={() => handleEdit(notice)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(notice.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNotice(undefined);
        }}
        onSave={handleSave}
        notice={editingNotice}
      />
    </>
  );
};