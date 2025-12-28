import { X, Stethoscope, Calendar, CheckCircle, XCircle, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Professional } from "@/types/data";
import { cn } from "@/lib/utils";

interface ProfessionalDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    professional: Professional;
}

export const ProfessionalDetailsModal = ({
    isOpen,
    onClose,
    professional,
}: ProfessionalDetailsModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Stethoscope className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-foreground">
                                    {professional.gender === 'masculino' ? 'Dr.' : 'Drª.'} {professional.name}
                                </DialogTitle>
                                <Badge variant="outline" className="mt-1 text-xs bg-blue-50 text-blue-600 border-blue-200 font-bold">
                                    {professional.specialty}
                                </Badge>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Fechar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    {/* Informações Principais - Lado a Lado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Idade que Atende */}
                        <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20">
                            <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                <Calendar className="h-4 w-4" />
                                IDADE QUE ATENDE
                            </div>
                            <p className="text-base font-medium text-foreground pl-6">
                                {professional.ageRange || 'Não especificado'}
                            </p>
                        </div>

                        {/* Aceita Encaixe */}
                        <div className={cn(
                            "space-y-3 p-4 border-2 rounded-lg",
                            professional.fittings.allowed
                                ? "bg-green-50/50 border-green-300 dark:bg-green-950/20 dark:border-green-700"
                                : "bg-red-50/50 border-red-300 dark:bg-red-950/20 dark:border-red-700"
                        )}>
                            <div className="flex items-center gap-2 text-sm font-bold">
                                {professional.fittings.allowed ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-green-800 dark:text-green-200">ACEITA ENCAIXE</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <span className="text-red-800 dark:text-red-200">NÃO ACEITA ENCAIXE</span>
                                    </>
                                )}
                            </div>
                            {professional.fittings.allowed ? (
                                <div className="pl-6">
                                    <p className="text-sm font-bold text-green-700 dark:text-green-300">
                                        Máximo: {professional.fittings.max} encaixe(s)
                                    </p>
                                    {professional.fittings.details && (
                                        <div className="mt-2 p-2 bg-white/60 dark:bg-gray-900/60 rounded border border-green-200 dark:border-green-800">
                                            <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">Regras:</p>
                                            <p className="text-xs text-green-700 dark:text-green-300 whitespace-pre-wrap leading-relaxed">
                                                {professional.fittings.details}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-red-600 dark:text-red-400 pl-6">
                                    Este profissional não aceita encaixes
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Observações Gerais */}
                    {professional.generalObs && (
                        <div className="space-y-3 p-5 border border-border rounded-lg bg-muted/10">
                            <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                <FileText className="h-4 w-4" />
                                OBSERVAÇÕES GERAIS
                            </div>
                            <div className="pl-6 p-4 bg-background/80 rounded-md border border-border/50">
                                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                    {professional.generalObs}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Mensagem caso não tenha observações */}
                    {!professional.generalObs && (
                        <div className="text-center py-6 text-muted-foreground/50 italic text-sm">
                            Nenhuma observação adicional registrada.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
