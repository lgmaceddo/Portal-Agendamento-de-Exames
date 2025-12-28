import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Trash2 } from "lucide-react";
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
import { categorySchema, CategoryFormData } from "@/schemas/scriptSchema";
import { Category } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: CategoryFormData) => void;
  onUpdate: (categoryId: string, data: Partial<Category>) => void;
  onDelete: (categoryId: string) => void;
  categories: Category[];
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

export const CategoryModal = ({
  open,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  categories,
}: CategoryModalProps) => {
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      color: colorOptions[0].value,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        color: colorOptions[0].value,
      });
      setSelectedColor(colorOptions[0].value);
      setEditingCategory(null);
    }
  }, [open, form]);

  const handleSubmit = (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        onUpdate(editingCategory.id, { name: data.name, color: selectedColor });
        toast({
          title: "Sucesso!",
          description: "Categoria atualizada com sucesso.",
        });
        setEditingCategory(null);
      } else {
        onAdd({ ...data, color: selectedColor });
        toast({
          title: "Sucesso!",
          description: "Categoria criada com sucesso.",
        });
      }
      form.reset();
      setSelectedColor(colorOptions[0].value);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a categoria.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setValue("name", category.name);
    setSelectedColor(category.color);
  };

  const handleDelete = (categoryId: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      onDelete(categoryId);
      toast({
        title: "Sucesso!",
        description: "Categoria excluída com sucesso.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.reset();
    setSelectedColor(colorOptions[0].value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="border-b pb-6">
              <h3 className="text-lg font-semibold text-primary mb-4">
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Nome da Categoria</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Consultas"
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
                  {editingCategory && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingCategory ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">
              Categorias Existentes
            </h3>
            <div className="space-y-2">
              {categories.length > 0 ? (
                categories.map((category) => {
                  const colorOption = colorOptions.find(
                    (c) => c.value === category.color
                  );
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn("w-6 h-6 rounded-full", colorOption?.bg)}
                        />
                        <span className="font-medium text-foreground">
                          {category.name.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
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
                  Nenhuma categoria criada ainda.
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
