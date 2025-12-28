import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { examSchema, ExamFormData } from "@/schemas/examSchema";
import { Category, ExamItem } from "@/types/data";
import { useToast } from "@/hooks/use-toast";

interface ExamModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ExamFormData) => void;
  categories: Category[];
  editingExam?: ExamItem & { categoryId: string };
}

const sectorOptions = [
  { value: "1º Andar", label: "1º Andar" },
  { value: "2º Andar", label: "2º Andar" },
  { value: "8º Andar", label: "8º Andar" },
  { value: "Saúde da Mulher", label: "Saúde da Mulher" },
];

const mainLocationOptions = [
  { value: "CDU", label: "CDU" },
  { value: "HOSPITAL", label: "HOSPITAL" },
  { value: "EXTERNO", label: "EXTERNO" },
];

export const ExamModal = ({
  open,
  onClose,
  onSave,
  categories,
  editingExam,
}: ExamModalProps) => {
  const { toast } = useToast();

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      code: "",
      title: "",
      categoryId: "",
      mainLocation: "CDU",
      sectors: [],
      extension: "",
      additionalInfo: "",
      rules: "",
    },
  });

  useEffect(() => {
    if (open && editingExam) {
      form.reset({
        code: editingExam.code || "",
        title: editingExam.title,
        categoryId: editingExam.categoryId,
        mainLocation: editingExam.mainLocation,
        sectors: editingExam.sectors,
        extension: editingExam.extension,
        additionalInfo: editingExam.additionalInfo,
        rules: editingExam.rules || "",
      });
    } else if (open && !editingExam) {
      form.reset({
        code: "",
        title: "",
        categoryId: categories[0]?.id || "",
        mainLocation: "CDU",
        sectors: [],
        extension: "",
        additionalInfo: "",
        rules: "",
      });
    }
  }, [open, editingExam, categories, form]);

  const handleSubmit = (data: ExamFormData) => {
    try {
      onSave(data);
      toast({
        title: "Sucesso!",
        description: editingExam
          ? "Exame atualizado com sucesso."
          : "Exame criado com sucesso.",
      });
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o exame.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {editingExam ? "Editar Exame" : "Adicionar Novo Exame"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nome do Exame</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: USG de Abdômen"
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Categoria</FormLabel>
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

            <FormField
              control={form.control}
              name="mainLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Local</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o local principal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mainLocationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sectors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Setor (selecione um ou mais)</FormLabel>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {sectorOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={field.value.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked
                              ? [...field.value, option.value]
                              : field.value.filter((val) => val !== option.value);
                            field.onChange(updatedValue);
                          }}
                        />
                        <label
                          htmlFor={option.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="extension"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Ramal</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 2110"
                      {...field}
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Informações Adicionais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite informações adicionais sobre o exame..."
                      rows={4}
                      {...field}
                      maxLength={2000}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Regras</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite as regras para este exame..."
                      rows={4}
                      {...field}
                      maxLength={2000}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 w-full"
                disabled={categories.length === 0}
              >
                {editingExam ? "Atualizar" : "Salvar"} Exame
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
