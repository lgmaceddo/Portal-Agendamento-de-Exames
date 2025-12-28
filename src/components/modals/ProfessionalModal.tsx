import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Professional } from "@/types/data";
import { useToast } from "@/hooks/use-toast";

interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (professional: Omit<Professional, "id">) => void;
  professional?: Professional | null;
}

export const ProfessionalModal = ({
  isOpen,
  onClose,
  onSave,
  professional,
}: ProfessionalModalProps) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    gender: "masculino" as 'masculino' | 'feminino',
    specialty: "",
    ageRange: "",
    fittingsAllowed: "Não",
    fittingsMax: 0,
    fittingsDetails: "",
    generalObs: "",
  });

  const fittingsAllowed = formData.fittingsAllowed === "Sim";

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name,
        gender: professional.gender,
        specialty: professional.specialty,
        ageRange: professional.ageRange,
        fittingsAllowed: professional.fittings.allowed ? "Sim" : "Não",
        fittingsMax: professional.fittings.max,
        fittingsDetails: professional.fittings.details,
        generalObs: professional.generalObs,
      });
    } else {
      setFormData({
        name: "",
        gender: "masculino",
        specialty: "",
        ageRange: "",
        fittingsAllowed: "Não",
        fittingsMax: 0,
        fittingsDetails: "",
        generalObs: "",
      });
    }
  }, [professional, isOpen]);

  const handleSave = () => {
    if (!formData.name || !formData.specialty || !formData.ageRange) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const professionalData: Omit<Professional, "id"> = {
      name: formData.name,
      gender: formData.gender,
      specialty: formData.specialty,
      ageRange: formData.ageRange,
      fittings: {
        allowed: fittingsAllowed,
        max: fittingsAllowed ? formData.fittingsMax : 0,
        details: fittingsAllowed ? formData.fittingsDetails : "",
      },
      generalObs: formData.generalObs,
      performedExams: professional?.performedExams || [], // Mantém os exames existentes se houver
    };

    onSave(professionalData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold text-primary">
              {professional ? "Editar Profissional" : "Novo Profissional"}
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

        <div className="space-y-6">
          {/* General Information */}
          <div className="space-y-4 p-5 border rounded-lg bg-gradient-to-br from-muted/20 to-muted/5">
            <h3 className="text-lg font-semibold text-primary border-b border-border/50 pb-2 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary"></span>
              Informações Gerais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name" className="font-bold text-foreground">
                  Nome do Profissional <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo (sem Dr./Drª.)"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="font-bold text-foreground">
                  Gênero <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as 'masculino' | 'feminino' })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino (Dr.)</SelectItem>
                    <SelectItem value="feminino">Feminino (Drª.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="font-bold text-foreground">
                Especialidade <span className="text-destructive">*</span>
              </Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ex: Cardiologia, Ortopedia, Pediatria..."
                className="bg-background"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="ageRange" className="font-bold text-foreground">
                  Idade que Atende <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ageRange"
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  placeholder="Ex: 18 a 65 anos, Todas as idades..."
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fittings" className="font-bold text-foreground">
                  Aceita Encaixes
                </Label>
                <Select
                  value={formData.fittingsAllowed}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      fittingsAllowed: value,
                      fittingsMax: value === "Não" ? 0 : formData.fittingsMax,
                      fittingsDetails: value === "Não" ? "" : formData.fittingsDetails,
                    });
                  }}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Sim">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {fittingsAllowed && (
                <div className="space-y-2">
                  <Label htmlFor="fittingsMax" className="font-bold text-foreground">
                    Máximo de Encaixes
                  </Label>
                  <Input
                    id="fittingsMax"
                    type="number"
                    min="0"
                    value={formData.fittingsMax}
                    onChange={(e) => setFormData({ ...formData, fittingsMax: parseInt(e.target.value) || 0 })}
                    className="bg-background"
                  />
                </div>
              )}
            </div>

            {fittingsAllowed && (
              <div className="space-y-2 border border-amber-200 rounded-lg p-4 bg-amber-50/50 dark:bg-amber-950/20">
                <Label htmlFor="fittingsDetails" className="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                  Regras/Observações sobre Encaixes
                </Label>
                <Textarea
                  id="fittingsDetails"
                  value={formData.fittingsDetails}
                  onChange={(e) => setFormData({ ...formData, fittingsDetails: e.target.value })}
                  placeholder="Observações específicas sobre encaixes..."
                  rows={2}
                  className="bg-background resize-none"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="generalObs" className="font-bold text-foreground">
                Observações Gerais
              </Label>
              <Textarea
                id="generalObs"
                value={formData.generalObs}
                onChange={(e) => setFormData({ ...formData, generalObs: e.target.value })}
                placeholder="Informações gerais sobre o profissional..."
                rows={3}
                className="bg-background resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
            className="min-w-[100px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 min-w-[100px]"
            type="button"
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};