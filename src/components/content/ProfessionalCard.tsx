import { useState, useMemo } from "react";
import { Pencil, Trash2, Check, X, Eye, AlertTriangle, ChevronDown, User, Calendar, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Professional, ExamDetail } from "@/types/data";
import { cn } from "@/lib/utils";
import { useExamMap } from "@/hooks/use-exam-map";
import { Separator } from "@/components/ui/separator";

interface ProfessionalCardProps {
  professional: Professional;
  onEdit?: (prof: Professional) => void;
  onDelete?: (id: string) => void;
  onViewDetails: (exam: ExamDetail, professionalName: string) => void;
}

export const ProfessionalCard = ({
  professional,
  onEdit,
  onDelete,
  onViewDetails,
}: ProfessionalCardProps) => {
  const canEdit = Boolean(onEdit && onDelete);
  const prefix = professional.gender === "masculino" ? "Dr." : "Drª.";
  const fullName = `${prefix} ${professional.name}`;
  const [isOpen, setIsOpen] = useState(false);
  const examMap = useExamMap();

  // Agrupar exames por categoria
  const examsByCategory = useMemo(() => {
    const groups: Record<string, ExamDetail[]> = {};
    professional.performedExams.forEach((exam) => {
      const examInfo = examMap[exam.examId];
      if (examInfo) {
        const category = examInfo.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(exam);
      }
    });
    return groups;
  }, [professional.performedExams, examMap]);

  const categories = Object.keys(examsByCategory).sort();
  const [activeCategory, setActiveCategory] = useState(categories[0] || "");

  const handleViewDetailsClick = (exam: ExamDetail) => {
    onViewDetails(exam, fullName);
  };
  
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const fittingsAllowed = professional.fittings.allowed;
  const hasFittingsDetails = fittingsAllowed && professional.fittings.details.trim().length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="overflow-hidden">
      <Card className={cn(
        "border-2 border-border/50 transition-all duration-300",
        isOpen ? "shadow-xl border-primary/50" : "hover:shadow-lg"
      )}>
        
        {/* Collapsible Trigger / Card Header - Layout Elegante */}
        <CollapsibleTrigger asChild>
          <CardHeader className={cn(
            "p-4 pb-4 flex-shrink-0 cursor-pointer transition-colors duration-200",
            isOpen ? "bg-primary/5" : "hover:bg-muted/50"
          )}>
            <div className="flex justify-between items-center w-full">
                
                {/* Coluna Principal: Nome e Especialidade + Estatísticas */}
                <div className="flex-1 min-w-0 pr-4 flex flex-col md:flex-row md:items-center md:gap-4">
                    
                    {/* Bloco 1: Nome e Especialidade (Largura controlada) */}
                    {/* Usamos w-64 (256px) em telas maiores para padronizar o espaço do nome */}
                    <div className="flex-shrink-0 w-full md:w-64">
                        <CardTitle className="text-2xl font-extrabold text-primary line-clamp-1 truncate" title={fullName}>
                            {fullName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-medium truncate" title={professional.specialty}>
                            {professional.specialty}
                        </p>
                    </div>
                    
                    {/* Separador Vertical (apenas em telas maiores) */}
                    <Separator orientation="vertical" className="hidden lg:block h-10 mx-2" />

                    {/* Bloco 2: Estatísticas Integradas (Ocupa o restante do espaço) */}
                    <div className="grid grid-cols-3 gap-4 mt-3 md:mt-0 flex-1">
                        
                        {/* Faixa Etária */}
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/50 border border-border/50 h-full">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs font-bold text-muted-foreground uppercase mt-1 text-center">
                                Faixa Etária
                            </p>
                            <p className="text-sm font-semibold text-foreground mt-0.5 text-center">
                                {professional.ageRange}
                            </p>
                        </div>

                        {/* Encaixes */}
                        <div className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-lg border h-full",
                            fittingsAllowed 
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                        )}>
                            <div className="flex items-center gap-1">
                                {fittingsAllowed ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                    <X className="h-4 w-4 text-red-600" />
                                )}
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mt-1 text-center">
                                Encaixes
                            </p>
                            <span
                                className={cn(
                                    "text-sm font-semibold mt-0.5 text-center",
                                    fittingsAllowed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                                )}
                            >
                                {fittingsAllowed
                                    ? `Sim (${professional.fittings.max})`
                                    : "Não"}
                            </span>
                            {/* Detalhes do Encaixe (Condicional) */}
                            {hasFittingsDetails && (
                                <p className="text-xs font-bold text-primary leading-tight mt-1 text-center">
                                    ({professional.fittings.details})
                                </p>
                            )}
                        </div>

                        {/* Exames Cadastrados */}
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-primary/10 border border-primary/20 h-full">
                            <Stethoscope className="h-4 w-4 text-primary" />
                            <p className="text-xs font-bold text-muted-foreground uppercase mt-1 text-center">
                                Exames
                            </p>
                            <p className="text-sm font-bold text-primary mt-0.5 text-center">
                                {professional.performedExams.length}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Ações e Toggle (Direita) */}
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {canEdit && (
                      <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { handleActionClick(e); onEdit?.(professional); }}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            title="Editar"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { handleActionClick(e); onDelete?.(professional.id); }}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Excluir"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <ChevronDown className={cn("h-5 w-5 text-primary transition-transform duration-300", isOpen && "rotate-180")} />
                </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        {/* Collapsible Content - Apenas Observações Gerais e Regras de Exames */}
        <CollapsibleContent>
          <CardContent className="p-4 pt-6 border-t border-border/50 bg-muted/10">
            
            {/* General Observations */}
            {professional.generalObs && (
              <div className="p-3 mb-6 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm text-foreground">
                  <span className="font-bold text-primary mr-1">Obs. Geral:</span>
                  {professional.generalObs}
                </p>
              </div>
            )}
            
            <h4 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Regras de Exames
            </h4>

            {categories.length > 0 ? (
              <Tabs
                value={activeCategory}
                onValueChange={setActiveCategory}
                className="w-full"
              >
                <TabsList className="flex-wrap h-auto justify-start bg-transparent border-b border-border rounded-none p-0">
                  {categories.map((category) => {
                    const categoryName = category === 'VALORES' ? 'EXAMES' : category;
                    const examCount = examsByCategory[category].length;
                    
                    return (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className={cn(
                          "py-3 px-4 text-sm font-medium transition-all data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:rounded-none data-[state=active]:ring-0 data-[state=active]:ring-offset-0",
                          "hover:bg-muted/80 text-muted-foreground"
                        )}
                      >
                        {categoryName} ({examCount})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="space-y-3">
                      {examsByCategory[category].map((exam) => {
                        const examInfo = examMap[exam.examId];
                        const hasAnesthesia = exam.withAnesthesia;
                        
                        return (
                          <div
                            key={exam.examId}
                            className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => handleViewDetailsClick(exam)}
                          >
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-foreground">
                                    {examInfo?.name || exam.examId}
                                </p>
                                {hasAnesthesia && (
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" aria-label="Requer Anestesia" />
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Clique para ver detalhes e regras específicas
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-border rounded-lg bg-card">
                <p>Nenhum exame cadastrado para este profissional.</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};