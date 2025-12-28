import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scriptSchema, ScriptFormData } from "@/schemas/scriptSchema";
import { Category, ScriptItem } from "@/types/data";
import { useToast } from "@/hooks/use-toast";

interface ScriptModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ScriptFormData) => void;
  categories: Category[];
  editingScript?: ScriptItem & { categoryId: string };
}

export const ScriptModal = ({
  open,
  onClose,
  onSave,
  categories,
  editingScript,
}: ScriptModalProps) => {
  const { toast } = useToast();
  const form = useForm<ScriptFormData>({
    resolver: zodResolver(scriptSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
      order: undefined,
    },
  });

  useEffect(() => {
    if (open && editingScript) {
      form.reset({
        title: editingScript.title,
        content: editingScript.content,
        categoryId: editingScript.categoryId,
        order: editingScript.order,
      });
    } else if (open && !editingScript) {
      form.reset({
        title: "",
        content: "",
        categoryId: categories[0]?.id || "",
        order: undefined,
      });
    }
  }, [open, editingScript, categories, form]);

  const handleSubmit = (data: ScriptFormData) => {
    try {
      onSave(data);
      toast({
        title: "Sucesso!",
        description: editingScript
          ? "Script atualizado com sucesso."
          : "Script criado com sucesso.",
      });
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o script.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingScript ? "Editar Script" : "Adicionar Novo Script"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name.toUpperCase()}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Crie uma categoria primeiro
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Título do Script</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Consulta Particular"
                        {...field}
                        maxLength={200}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Ordem</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="#"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : parseInt(value));
                        }}
                        className="text-center"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo do Script</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o conteúdo do script..."
                      rows={10}
                      {...field}
                      maxLength={5000}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    {field.value.length}/5000 caracteres
                  </p>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={categories.length === 0}
              >
                {editingScript ? "Atualizar" : "Salvar"} Script
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};