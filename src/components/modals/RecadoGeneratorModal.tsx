import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { RecadoCategory, RecadoItem } from "@/types/data";
import { replaceUserNamePlaceholders } from "@/lib/textReplacer";

interface RecadoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RecadoItem;
  category: RecadoCategory;
}

export const RecadoGeneratorModal = ({
  isOpen,
  onClose,
  item,
  category,
}: RecadoGeneratorModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { userName } = useData();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialValues: Record<string, string> = {};
      item.fields.forEach(field => {
        initialValues[field] = "";
      });
      setFieldValues(initialValues);
    }
  }, [isOpen, item.fields]);

  const handleFieldChange = (field: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [field]: value }));
  };

  const generateMessage = () => {
    let message = item.content;

    // 1. Substituir placeholders de campos dinâmicos
    item.fields.forEach(field => {
      // Aplica MAIÚSCULAS e formatação de negrito (*valor*)
      const rawValue = fieldValues[field] || 'N/A';
      const formattedValue = `*${rawValue.toUpperCase()}*`;
      
      message = message.replace(new RegExp(`\\[${field}\\]`, 'g'), formattedValue);
    });

    // 2. Substituir placeholder de nome do usuário
    message = replaceUserNamePlaceholders(message, userName);

    return message;
  };

  const generatedMessage = generateMessage();

  const handleCopy = async () => {
    // Validação simples: se houver campos obrigatórios (todos são considerados), verificar se foram preenchidos
    const requiredFieldsFilled = item.fields.every(field => fieldValues[field]?.trim());
    
    if (item.fields.length > 0 && !requiredFieldsFilled) {
        toast({
            variant: "destructive",
            title: "Preencha os campos",
            description: "Preencha todos os campos obrigatórios para gerar o recado completo.",
        });
        return;
    }

    try {
      // Remove os asteriscos de negrito antes de copiar, se o usuário não quiser a formatação do WhatsApp
      // No entanto, como o objetivo é copiar para o WhatsApp, manteremos os asteriscos.
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

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'paciente': return 'Nome do Paciente';
      case 'medico': return 'Dr(a). Solicitante';
      case 'guia': return 'Guia (se possuir)';
      case 'telefone': return 'Telefone';
      case 'carteirinha': return 'Carteirinha';
      case 'idade': return 'Idade';
      case 'exame': return 'Exame(s)';
      case 'procedimento': return 'Procedimento';
      default: return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Gerar Recado: {item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Section */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Destinatário: {category.destinationType === 'group' ? category.groupName : category.title}
                </h4>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  {category.description}
                </p>
                {category.destinationType === 'attendant' && category.attendants && category.attendants.length > 0 && (
                    <div className="mt-3 space-y-1">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Atendentes:</p>
                        {category.attendants.map((attendant) => (
                            <div key={attendant.id} className="text-sm text-emerald-900 dark:text-emerald-100">
                                <span className="font-medium">- {attendant.name}:</span>{" "}
                                <span className="bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                                    {attendant.chatNick}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          {item.fields.length > 0 && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-semibold text-primary">Preencha os Dados do Recado</h4>
                <div className="grid grid-cols-2 gap-4">
                    {item.fields.map(field => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field} className="font-bold">{getFieldLabel(field)}</Label>
                            <Input
                                id={field}
                                value={fieldValues[field]}
                                onChange={(e) => handleFieldChange(field, e.target.value)}
                                placeholder={`Digite o ${getFieldLabel(field).toLowerCase()}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
          )}

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