import { X, MapPin, Phone, Info, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExamItem } from "@/types/data";
import { cn } from "@/lib/utils";

interface ExamItemDetailsModalProps {
  open: boolean;
  onClose: () => void;
  exam: ExamItem;
}

export const ExamItemDetailsModal = ({
  open,
  onClose,
  exam,
}: ExamItemDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start border-b pb-4">
            <DialogTitle className="text-2xl font-bold">
              {exam.code && <span className="text-muted-foreground mr-2 font-mono text-lg">{exam.code} -</span>}
              {exam.title}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Local Principal, Setor e Ramal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Local</span>
              <Badge
                variant="secondary"
                className={cn(
                  "w-fit font-bold border",
                  exam.mainLocation === "CDU" && "bg-teal-50 text-teal-800 border-teal-200",
                  exam.mainLocation === "HOSPITAL" && "bg-orange-50 text-orange-600 border-orange-200",
                  exam.mainLocation === "EXTERNO" && "bg-red-50 text-red-800 border-red-200"
                )}
              >
                {exam.mainLocation || "CDU"}
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Ramal</span>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-bold">{exam.extension}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Setores</span>
              <div className="flex flex-wrap gap-1">
                {(exam.sectors || (exam as any).location || []).map((sector: string, idx: number) => {
                  const isSaudeDaMulher = sector.toLowerCase().includes('saúde da mulher') || sector.toLowerCase().includes('saude da mulher');
                  return (
                    <Badge
                      key={idx}
                      className={isSaudeDaMulher
                        ? "bg-red-50 text-red-600 border-red-200 font-bold text-[10px]"
                        : "bg-muted/50 text-foreground border-border font-bold text-[10px]"
                      }
                    >
                      {sector.toUpperCase()}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          {exam.additionalInfo && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Info className="h-4 w-4" />
                INFORMAÇÕES ADICIONAIS
              </h3>
              <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-foreground whitespace-pre-wrap font-medium leading-relaxed">
                  {exam.additionalInfo}
                </p>
              </div>
            </div>
          )}

          {/* Regras */}
          {exam.rules && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <FileText className="h-4 w-4" />
                REGRAS
              </h3>
              <div className="bg-blue-50/30 rounded-lg p-4 border border-blue-100/50">
                <p className="text-sm text-foreground whitespace-pre-wrap font-medium leading-relaxed">
                  {exam.rules}
                </p>
              </div>
            </div>
          )}

          {/* Botão Fechar */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
