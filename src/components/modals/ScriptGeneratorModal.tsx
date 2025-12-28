import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ScriptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: string;
}

export const ScriptGeneratorModal = ({ isOpen, onClose, script }: ScriptGeneratorModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      toast({
        title: "Script copiado!",
        description: "Script copiado.",
        variant: "compact",
        duration: 1000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar o script.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Script Gerado</DialogTitle>
          <p className="sr-only">Pré-visualização do conteúdo a ser copiado para o WhatsApp</p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground" aria-label="Pré-visualização do script">
              {script}
            </pre>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={handleCopy} className="bg-primary hover:bg-primary/90">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Script
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
