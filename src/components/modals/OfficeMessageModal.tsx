import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Office } from "@/types/data";
import { useData } from "@/contexts/DataContext";

interface OfficeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProcedures: string[];
  office: Office;
  isCustomMessage?: boolean;
}

export const OfficeMessageModal = ({
  isOpen,
  onClose,
  selectedProcedures,
  office,
  isCustomMessage = false,
}: OfficeMessageModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { userName } = useData();

  // Form fields
  const [doctorName, setDoctorName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [guide, setGuide] = useState("");
  const [customMessageText, setCustomMessageText] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDoctorName("");
      setPatientName("");
      setAge("");
      setPhone("");
      setCardNumber("");
      setGuide("");
      setCustomMessageText("");
    }
  }, [isOpen, office]);

  const generateMessage = () => {
    if (!isCustomMessage && selectedProcedures.length === 0) return "";

    let message = "";

    if (isCustomMessage) {
      // Mensagem personalizada - formato simplificado
      message = `${customMessageText}\n\n`;
      message += `Nome do Paciente: ${patientName}\n`;
      message += `Telefone: ${phone}\n`;
      message += `Carteirinha: ${cardNumber}\n\n`;
    } else {
      // Mensagem com procedimentos selecionados - formato completo
      if (selectedProcedures.length === 1) {
        message = `Solicitação de ${selectedProcedures[0]}, segue os dados:\n\n`;
      } else if (selectedProcedures.length === 2) {
        message = `Solicitação de ${selectedProcedures[0]} e ${selectedProcedures[1]}, segue os dados:\n\n`;
      } else {
        const lastProcedure = selectedProcedures[selectedProcedures.length - 1];
        const otherProcedures = selectedProcedures.slice(0, -1).join(", ");
        message = `Solicitação de ${otherProcedures} e ${lastProcedure}, segue os dados:\n\n`;
      }
      
      message += `Dr(a). Solicitante: ${doctorName}\n`;
      message += `Nome do Paciente: ${patientName}\n`;
      message += `Idade: ${age}\n`;
      message += `Telefone: ${phone}\n`;
      message += `Carteirinha: ${cardNumber}\n`;
      message += `Guia (se já possuir): ${guide}\n\n`;
    }

    message += `Obrigado!\n`;
    message += `${userName} / Agendamento`;

    return message;
  };

  const generatedMessage = generateMessage();

  const handleCopy = async () => {
    // Validação específica para mensagem customizada
    if (isCustomMessage && !customMessageText.trim()) {
      toast({
        variant: "destructive",
        title: "Mensagem obrigatória",
        description: "Digite a mensagem personalizada antes de gerar o recado.",
      });
      return;
    }

    if (!generatedMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Preencha os campos",
        description: "Preencha os dados para gerar o recado.",
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
          <DialogTitle>
            {isCustomMessage ? "Recado Personalizado para o Setor" : "Gerar Recado para o Setor"}
          </DialogTitle>
          <p className="sr-only">Formulário para gerar recado de solicitação de procedimento</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Observações Section with light green background */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Observações
                </h4>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  {isCustomMessage 
                    ? "Digite sua mensagem personalizada e preencha os dados do paciente. Após, copie e envie para o chat de um dos atendentes responsáveis pelo setor:"
                    : "Preencha os dados para gerar o recado. Após, copie e envie para o chat de um dos atendentes responsáveis pelo setor:"
                  }
                </p>
                <div className="mt-3 space-y-1">
                  {office.attendants.length > 0 ? (
                    office.attendants.map((attendant) => (
                      <div
                        key={attendant.id}
                        className="text-sm text-emerald-900 dark:text-emerald-100"
                      >
                        <span className="font-medium">- {attendant.name}:</span>{" "}
                        <span className="bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                          {attendant.username}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Nenhum atendente cadastrado para este setor.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Message Field - only shows when isCustomMessage is true */}
          {isCustomMessage && (
            <div className="space-y-2">
              <Label htmlFor="customMessage">
                Mensagem Personalizada <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="customMessage"
                value={customMessageText}
                onChange={(e) => setCustomMessageText(e.target.value)}
                placeholder="Digite aqui a sua solicitação personalizada para o setor..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Descreva detalhadamente o que você precisa solicitar ao setor.
              </p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {!isCustomMessage && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Dr(a). Solicitante</Label>
                    <Input
                      id="doctor"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="Nome do médico"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient">Nome do Paciente</Label>
                    <Input
                      id="patient"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nome do paciente"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Idade"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Telefone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card">Carteirinha</Label>
                    <Input
                      id="card"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Número da carteirinha"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guide">Guia (se já possuir)</Label>
                  <Input
                    id="guide"
                    value={guide}
                    onChange={(e) => setGuide(e.target.value)}
                    placeholder="Número da guia"
                  />
                </div>
              </>
            )}

            {isCustomMessage && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Nome do Paciente</Label>
                  <Input
                    id="patient"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nome do paciente"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Telefone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card">Carteirinha</Label>
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
            <Label>Recado Gerado</Label>
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
