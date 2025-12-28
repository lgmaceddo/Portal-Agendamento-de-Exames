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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { contactSchema, ContactFormData } from "@/schemas/contactSchema";
import { Category, ContactItem } from "@/types/data";
import { useToast } from "@/hooks/use-toast";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ContactFormData) => void;
  categories: Category[];
  editingContact?: ContactItem & { categoryId: string };
}

export const ContactModal = ({
  open,
  onClose,
  onSave,
  categories,
  editingContact,
}: ContactModalProps) => {
  const { toast } = useToast();
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      setor: "",
      local: "",
      ramal: "",
      telefone: "",
      whatsapp: "",
      // categoryId não é mais necessário no formulário, mas mantemos no tipo para compatibilidade
      categoryId: categories[0]?.id || "", 
    },
  });

  useEffect(() => {
    if (open && editingContact) {
      form.reset({
        setor: editingContact.setor,
        local: editingContact.local,
        ramal: editingContact.ramal,
        telefone: editingContact.telefone,
        whatsapp: editingContact.whatsapp,
        categoryId: editingContact.categoryId,
      });
    } else if (open && !editingContact) {
      form.reset({
        setor: "",
        local: "",
        ramal: "",
        telefone: "",
        whatsapp: "",
        categoryId: categories[0]?.id || "",
      });
    }
  }, [open, editingContact, categories, form]);

  const handleSubmit = (data: ContactFormData) => {
    try {
      // Força o categoryId para o ID da única categoria existente (GERAL)
      const dataWithCategory: ContactFormData = {
        ...data,
        categoryId: categories[0]?.id || "cont-cat-geral",
      };

      onSave(dataWithCategory);
      toast({
        title: "Sucesso!",
        description: editingContact
          ? "Contato atualizado com sucesso."
          : "Contato criado com sucesso.",
      });
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o contato.",
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
            {editingContact ? "Editar Contato" : "Adicionar Novo Contato"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Campo de Categoria removido para simplificar */}
            
            <FormField
              control={form.control}
              name="setor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Setor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Recepção Principal"
                      {...field}
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="local"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Local</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Prédio de Consultas"
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
                name="ramal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Ramal</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 1001 / 1002"
                        {...field}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: (14) 3235-3333"
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
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: (14) 99999-1111"
                        {...field}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
              >
                {editingContact ? "Atualizar" : "Salvar"} Contato
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};