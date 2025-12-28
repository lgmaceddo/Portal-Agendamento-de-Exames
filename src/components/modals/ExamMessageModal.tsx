import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

interface ExamMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExamTypes: string[];
}

export const ExamMessageModal = ({
  isOpen,
  onClose,
  selectedExamTypes,
}: ExamMessageModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { userName } = useData();

  // Form fields
  const [doctorName, setDoctorName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [examNames, setExamNames] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDoctorName("");
      setPatientName("");
      setAge("");
      setPhone("");
      setCardNumber("");
      setExamNames("");
    }
  }, [isOpen]);

  const examTypeNames: Record<string, string> = {
    creatinina: "Creatinina",
    tsh: "TSH",
    "core-biopsia": "procedimento de Core Biópsia Agulha Grossa",
    "exames-vencidos": "Solicitação de Exames (prazo de entrega vencido)",
    "solicitacao-imagens": "Solicitação de Imagens",
  };

  const getTargetGroup = () => {
    const hasCoreBiopsia = selectedExamTypes.includes("core-biopsia");
    const hasCreatininaOrTsh = selectedExamTypes.some((type) =>
      ["creatinina", "tsh"].includes(type)
    );

    if (hasCoreBiopsia && hasCreatininaOrTsh) {
      return "Grupos: Creatinina/TSH e Core Biópsia";
    } else if (hasCoreBiopsia) {
      return "Grupo: Core Biópsia";
    } else {
      return "Grupo: Creatinina / TSH";
    }
  };

  const generateMessage = () => {
    if (selectedExamTypes.length === 0) return "";

    let message = "";

    // Check if it's a special type (exames-vencidos or solicitacao-imagens)
    const isExamesVencidos = selectedExamTypes.includes("exames-vencidos");
    const isSolicitacaoImagens = selectedExamTypes.includes("solicitacao-imagens");

    if (isExamesVencidos) {
      message = `Olá! O paciente entrou em contato solicitando o resultado de seus exames, cujo prazo de entrega está vencido.\n\n`;
      message += `Exame(s): ${examNames}\n\n`;
      message += `Segue os dados:\n\n`;
      message += `Nome do Paciente: ${patientName}\n`;
      message += `Telefone: ${phone}\n`;
      message += `Número da Carteirinha: ${cardNumber}\n\n`;
      message += `Obrigado!\n`;
      message += `${userName} / Agendamento`;
      return message;
    }

    if (isSolicitacaoImagens) {
      message = `Olá! O paciente entrou em contato solicitando imagens de exame.\n\n`;
      message += `Exame(s): ${examNames}\n\n`;
      message += `Nome do Paciente: ${patientName}\n`;
      message += `Telefone: ${phone}\n`;
      message += `Número da Carteirinha: ${cardNumber}\n\n`;
      message += `Obrigado!\n`;
      message += `${userName} / Agendamento`;
      return message;
    }

    // Original logic for creatinina, tsh, and core-biopsia
    const examTypeDisplayNames = selectedExamTypes.map((type) => examTypeNames[type]);
    if (examTypeDisplayNames.length === 1) {
      message = `Solicitação de ${examTypeDisplayNames[0]}\n\n`;
    } else if (examTypeDisplayNames.length === 2) {
      message = `Solicitação de ${examTypeDisplayNames[0]} e ${examTypeDisplayNames[1]}\n\n`;
    } else {
      const lastExam = examTypeDisplayNames[examTypeDisplayNames.length - 1];
      const otherExams = examTypeDisplayNames.slice(0, -1).join(", ");
      message = `Solicitação de ${otherExams} e ${lastExam}\n\n`;
    }

    message += `Segue os dados:\n\n`;
    message += `Dr(a). Solicitante: ${doctorName}\n`;
    message += `Nome do Paciente: ${patientName}\n`;
    message += `Idade: ${age}\n`;
    message += `Telefone: ${phone}\n`;
    message += `Carteirinha: ${cardNumber}\n\n`;

    message += `Obrigado!\n`;
    message += `${userName} / Agendamento`;

    return message;
  };

  const generatedMessage = generateMessage();

  const handleCopy = async () => {
    if (!generatedMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Preencha os campos",
        description: "Preencha todos os dados para gerar o recado.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      toast({
        title: "Recado copiado!",
        description: "Recado copiado.",
        variant: "compact",
        duration: 1000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar o recado.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Gerar Recado para o Grupo</DialogTitle>
          <p className="sr-only">Formulário para gerar recado de solicitação de exame</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Section */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Observações
                </h4>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  Preencha os dados para gerar o recado. Após, copie e envie para o chat do
                  grupo responsável através do grupo no chat.
                </p>
              </div>
            </div>
          </div>

          {/* Selected Exams Display */}
          <div className="space-y-2">
            <Label className="font-bold">Exames Selecionados</Label>
            <div className="flex flex-wrap gap-2">
              {selectedExamTypes.map((type) => (
                <div
                  key={type}
                  className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  {examTypeNames[type]}
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Show exam names field only for special types */}
            {(selectedExamTypes.includes("exames-vencidos") || 
              selectedExamTypes.includes("solicitacao-imagens")) && (
              <div className="space-y-2">
                <Label htmlFor="examNames" className="font-bold">Exame(s)</Label>
                <Input
                  id="examNames"
                  value={examNames}
                  onChange={(e) => setExamNames(e.target.value)}
                  placeholder="Digite o(s) nome(s) do(s) exame(s)"
                />
              </div>
            )}

            {/* Show doctor and patient fields only for regular types */}
            {!selectedExamTypes.includes("exames-vencidos") && 
             !selectedExamTypes.includes("solicitacao-imagens") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor" className="font-bold">Dr(a). Solicitante</Label>
                  <Input
                    id="doctor"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Nome do médico"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient" className="font-bold">Nome do Paciente</Label>
                  <Input
                    id="patient"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nome do paciente"
                  />
                </div>
              </div>
            )}

            {/* Show simplified patient field for special types */}
            {(selectedExamTypes.includes("exames-vencidos") || 
              selectedExamTypes.includes("solicitacao-imagens")) && (
              <div className="space-y-2">
                <Label htmlFor="patient" className="font-bold">Nome do Paciente</Label>
                <Input
                  id="patient"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nome do paciente"
                />
              </div>
            )}

            {/* Idade, Telefone, and Carteirinha on same line for regular types */}
            {!selectedExamTypes.includes("exames-vencidos") && 
             !selectedExamTypes.includes("solicitacao-imagens") && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="font-bold">Idade</Label>
                  <Input
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Idade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Telefone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card" className="font-bold">Carteirinha</Label>
                  <Input
                    id="card"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Número da carteirinha"
                  />
                </div>
              </div>
            )}

            {/* Telefone and Carteirinha on same line for special types */}
            {(selectedExamTypes.includes("exames-vencidos") || 
              selectedExamTypes.includes("solicitacao-imagens")) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Telefone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card" className="font-bold">Número da Carteirinha</Label>
                  <Input
                    id="card"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Número da carteirinha"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generated Message Preview */}
          <div className="space-y-2">
            <Label className="font-bold">Recado Gerado</Label>
            <div className="bg-muted/50 rounded-lg p-4 min-h-[200px]">
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                {generatedMessage || "Preencha os campos acima para gerar o recado..."}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
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
                  Copiar Recado
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};