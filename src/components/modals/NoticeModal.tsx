import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Notice, NoticeTag } from "@/types/notice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: Omit<Notice, "id" | "date"> & { id?: string, date?: string }) => void;
  notice?: Notice;
}

const tagOptions: { value: NoticeTag; label: string }[] = [
  { value: "URGENTE", label: "🚨 URGENTE" },
  { value: "FLUXO", label: "🔄 Fluxo / Processo" },
  { value: "SISTEMA", label: "💻 Sistema / TI" },
  { value: "TREINAMENTO", label: "📚 Treinamento" },
  { value: "GERAL", label: "📢 Geral" },
];

export const NoticeModal = ({ isOpen, onClose, onSave, notice }: NoticeModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<NoticeTag>("GERAL");

  useEffect(() => {
    if (notice) {
      setTitle(notice.title);
      setContent(notice.content);
      setTag(notice.tag);
    } else {
      setTitle("");
      setContent("");
      setTag("GERAL");
    }
  }, [notice, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      return;
    }

    const currentDate = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    onSave({
      ...(notice?.id && { id: notice.id }),
      title: title.trim(),
      content: content.trim(),
      tag: tag,
      date: notice?.date || currentDate,
    });

    setTitle("");
    setContent("");
    setTag("GERAL");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{notice ? "Editar Aviso" : "Criar Novo Aviso"}</DialogTitle>
          <p className="sr-only">Formulário para {notice ? "editar" : "criar"} aviso</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Título do Aviso</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Atualização do Sistema"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Categoria (Tag)</Label>
              <Select value={tag} onValueChange={(value) => setTag(value as NoticeTag)}>
                <SelectTrigger id="tag">
                  <SelectValue placeholder="Selecione a tag" />
                </SelectTrigger>
                <SelectContent>
                  {tagOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva o aviso aqui..."
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {notice ? "Atualizar" : "Criar"} Aviso
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};