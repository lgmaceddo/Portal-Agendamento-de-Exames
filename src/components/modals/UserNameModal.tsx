import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserNameModalProps {
  open: boolean;
  onSave: (name: string) => void;
}

export const UserNameModal = ({ open, onSave }: UserNameModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md"  onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Bem-vindo ao Portal!</DialogTitle>
          <DialogDescription className="text-center">
            Para começar, nos diga como você se chama
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              autoFocus
              className="text-lg"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={!name.trim()}>
            Começar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
