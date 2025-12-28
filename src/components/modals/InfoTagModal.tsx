import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { infoTagSchema, InfoTagFormData } from "@/schemas/infoSchema";
import { InfoTag } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface InfoTagModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<InfoTag, "id"> | InfoTag) => void;
  onEdit: (tag: InfoTag) => void;
  onDelete: (tagId: string) => void;
  tags: InfoTag[];
  editingTag?: InfoTag;
}

const colorOptions = [
  { value: "text-teal-800", bg: "bg-teal-500", label: "Teal" },
  { value: "text-blue-800", bg: "bg-blue-500", label: "Azul" },
  { value: "text-red-800", bg: "bg-red-500", label: "Vermelho" },
  { value: "text-purple-800", bg: "bg-purple-500", label: "Roxo" },
  { value: "text-orange-800", bg: "bg-orange-500", label: "Laranja" },
  { value: "text-green-800", bg: "bg-green-500", label: "Verde" },
  { value: "text-pink-800", bg: "bg-pink-500", label: "Rosa" },
  { value: "text-indigo-800", bg: "bg-indigo-500", label: "Índigo" },
];

export const InfoTagModal = ({
  open,
  onClose,
  onSave,
  onEdit,
  onDelete,
  tags,
  editingTag,
}: InfoTagModalProps) => {
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);

  const form = useForm<InfoTagFormData>({
    resolver: zodResolver(infoTagSchema),
    defaultValues: {
      name: "",
      color: colorOptions[0].value,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingTag) {
        form.reset({
          name: editingTag.name,
          color: editingTag.color,
        });
        setSelectedColor(editingTag.color);
      } else {
        form.reset({
          name: "",
          color: colorOptions[0].value,
        });
        setSelectedColor(colorOptions[0].value);
      }
    }
  }, [open, editingTag, form]);

  const handleSubmit = (data: InfoTagFormData) => {
    try {
      const finalData = { ...data, color: selectedColor };
      
      if (editingTag) {
        onSave({ ...editingTag, ...finalData });
        toast({
          title: "Sucesso!",
          description: "Etiqueta atualizada com sucesso.",
        });
      } else {
        onSave(finalData);
        toast({
          title: "Sucesso!",
          description: "Etiqueta criada com sucesso.",
        });
      }
      form.reset();
      setSelectedColor(colorOptions[0].value);
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a etiqueta.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    onClose();
  };

  const handleDelete = (tagId: string) => {
    if (confirm("Tem certeza que deseja excluir esta etiqueta? Todos os itens associados serão perdidos.")) {
      onDelete(tagId);
      toast({
        title: "Sucesso!",
        description: "Etiqueta excluída com sucesso.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Etiquetas de Informação</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="border-b pb-6">
              <h3 className="text-lg font-semibold text-primary mb-4">
                {editingTag ? "Editar Etiqueta" : "Nova Etiqueta"}
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Nome da Etiqueta</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Regras de Encaixe"
                          {...field}
                          maxLength={50}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-2">
                  <FormLabel>Cor</FormLabel>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          color.bg,
                          selectedColor === color.value
                            ? "ring-2 ring-offset-2 ring-primary"
                            : "ring-2 ring-transparent hover:ring-gray-300"
                        )}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {editingTag && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingTag ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">
              Etiquetas Existentes
            </h3>
            <div className="space-y-2">
              {tags.length > 0 ? (
                tags.map((tag) => {
                  const colorOption = colorOptions.find(
                    (c) => c.value === tag.color
                  );
                  return (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn("w-6 h-6 rounded-full", colorOption?.bg)}
                        />
                        <span className="font-medium text-foreground">
                          {tag.name.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(tag)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(tag.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma etiqueta criada ainda.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};