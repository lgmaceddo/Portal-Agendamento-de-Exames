import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ExamDeliveryAttendant } from "@/types/data";

interface ExamDeliveryAttendantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attendant: Omit<ExamDeliveryAttendant, "id"> | ExamDeliveryAttendant) => void;
  attendant?: ExamDeliveryAttendant;
}

export const ExamDeliveryAttendantModal = ({
  isOpen,
  onClose,
  onSave,
  attendant,
}: ExamDeliveryAttendantModalProps) => {
  const [name, setName] = useState("");
  const [chatNick, setChatNick] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (attendant) {
        setName(attendant.name);
        setChatNick(attendant.chatNick);
      } else {
        setName("");
        setChatNick("");
      }
    }
  }, [isOpen, attendant]);

  const handleSave = () => {
    if (!name.trim() || !chatNick.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
      });
      return;
    }

    if (attendant) {
      onSave({ ...attendant, name: name.trim(), chatNick: chatNick.trim() });
    } else {
      onSave({ name: name.trim(), chatNick: chatNick.trim() });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {attendant ? "Editar Atendente" : "Adicionar Atendente"}
          </DialogTitle>
          <p className="sr-only">
            Formulário para {attendant ? "editar" : "adicionar"} atendente do setor de entrega de exames
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Atendente</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Gustavo Silva"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatNick">Nick no Chat</Label>
            <Input
              id="chatNick"
              value={chatNick}
              onChange={(e) => setChatNick(e.target.value)}
              placeholder="Ex: Gustavo"
            />
            <p className="text-xs text-muted-foreground">
              Nome que aparece no chat do grupo
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
