import { Copy, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScriptItem } from "@/types/data";
import { useData } from "@/contexts/DataContext";
import { replaceUserNamePlaceholders } from "@/lib/textReplacer";
import { useToast } from "@/hooks/use-toast";

interface ScriptDetailsModalProps {
  open: boolean;
  onClose: () => void;
  script: ScriptItem;
}

export const ScriptDetailsModal = ({
  open,
  onClose,
  script,
}: ScriptDetailsModalProps) => {
  const { userName } = useData();
  const { toast } = useToast();

  const handleCopy = () => {
    const processedContent = replaceUserNamePlaceholders(script.content, userName);
    navigator.clipboard.writeText(processedContent);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado.",
      variant: "compact",
      duration: 1000,
    });
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">{script.title}</DialogTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="py-6">
          <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
            {replaceUserNamePlaceholders(script.content, userName)}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
