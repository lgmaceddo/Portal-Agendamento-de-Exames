import { Copy, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExamDetail } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { useExamMap } from "@/hooks/use-exam-map"; // Importando o novo hook

interface ExamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamDetail | null;
  professionalName: string;
}

export const ExamDetailsModal = ({
  isOpen,
  onClose,
  exam,
  professionalName,
}: ExamDetailsModalProps) => {
  const { toast } = useToast();
  const examMap = useExamMap(); // Usando o novo hook

  if (!exam) return null;

  const examInfo = examMap[exam.examId]; // Usando o mapa unificado
  const examName = examInfo?.name || exam.examId;
  
  if (!examInfo) {
    // Se não encontrar no mapa, ainda podemos exibir o ID como fallback, mas o nome deve ser o ID
    // Para evitar que o modal quebre, garantimos que examName existe.
    console.warn(`Exam ID ${exam.examId} not found in exam map.`);
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado.",
      variant: "compact",
      duration: 1000,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle>Detalhes do Exame</DialogTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Professional */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Profissional</p>
            <p className="text-lg font-bold text-foreground">
              {professionalName.toUpperCase()}
            </p>
          </div>

          {/* Exam Name */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Exame</p>
            <p className="text-lg font-bold text-foreground">{examName}</p>
          </div>

          {/* Observations */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-base font-semibold text-foreground">Observações</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(exam.observations, "Observações")}
                className="h-8"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {exam.observations}
              </p>
            </div>
          </div>

          {/* Preparation */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-base font-semibold text-foreground">Preparo</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(exam.preparation, "Preparo")}
                className="h-8"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {exam.preparation}
              </p>
            </div>
          </div>

          {/* Anesthesia Info (if applicable) */}
          {exam.withAnesthesia && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-base font-semibold text-foreground">Instruções com Anestesia (SGU)</p>
                {exam.anesthesiaInstructions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(exam.anesthesiaInstructions || "", "Instruções de Anestesia")
                    }
                    className="h-8"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                )}
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {exam.anesthesiaInstructions || "Nenhuma instrução de anestesia fornecida."}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};