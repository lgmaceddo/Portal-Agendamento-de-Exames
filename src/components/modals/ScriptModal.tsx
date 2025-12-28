import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
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
  onSave: (data: ScriptFormData) => Promise<void>;
  categories: Category[];
  editingScript?: ScriptItem & { categoryId: string };
  isSaving: boolean;
}

export const ScriptModal = ({
  open,
  onClose,
  onSave,
  categories,
  editingScript,
  isSaving,
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

  const handleSubmit = async (data: ScriptFormData) => {
    try {
      await onSave(data);
      form.reset();
      onClose();
    } catch (error) {
      // Erro já tratado no Content, mas mantemos o catch para evitar crash
      console.error(error);
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
                    disabled={isSaving}
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
                        disabled={isSaving}
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
                        disabled={isSaving}
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
                      disabled={isSaving}
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
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={categories.length === 0 || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  editingScript ? "Atualizar" : "Salvar"
                )} Script
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};