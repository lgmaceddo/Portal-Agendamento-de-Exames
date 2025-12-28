import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HeaderTagInfo } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

const phoneSchema = z.object({
  label: z.string().min(1, "Campo obrigatório"),
  number: z.string().min(1, "Campo obrigatório"),
});

const contactSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  phone: z.string().min(1, "Campo obrigatório"),
  ramal: z.string().min(1, "Campo obrigatório"),
});

const headerTagSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  address: z.string().optional(),
  phones: z.array(phoneSchema).optional(),
  whatsapp: z.string().optional(),
  contacts: z.array(contactSchema).optional(),
});

type FormData = z.infer<typeof headerTagSchema>;

interface HeaderTagModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<HeaderTagInfo, "id" | "tag">) => void;
  tagInfo: HeaderTagInfo;
}

export const HeaderTagModal = ({ open, onClose, onSave, tagInfo }: HeaderTagModalProps) => {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(headerTagSchema),
    defaultValues: {
      title: "",
      address: "",
      phones: [],
      whatsapp: "",
      contacts: [],
    },
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: form.control,
    name: "phones",
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  useEffect(() => {
    if (open && tagInfo) {
      form.reset({
        title: tagInfo.title || "",
        address: tagInfo.address || "",
        phones: tagInfo.phones || [],
        whatsapp: tagInfo.whatsapp || "",
        contacts: tagInfo.contacts || [],
      });
    }
  }, [open, tagInfo, form]);

  const handleSubmit = (data: FormData) => {
    try {
      onSave(data);
      toast({
        title: "Sucesso",
        description: "Informações atualizadas com sucesso!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar informações.",
        variant: "destructive",
      });
    }
  };

  const isContactsType = tagInfo.tag === "GERENCIA";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Informações - {tagInfo.tag}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isContactsType && (
              <>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel>Telefones</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendPhone({ label: "", number: "" })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  {phoneFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`phones.${index}.label`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...field} placeholder="Label (ex: Consultas)" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`phones.${index}.number`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...field} placeholder="Número" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhone(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Geral</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(14) 99999-9999" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {isContactsType && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Contatos</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendContact({ name: "", phone: "", ramal: "" })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                {contactFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder="Nome" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.phone`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder="Telefone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.ramal`}
                      render={({ field }) => (
                        <FormItem className="flex-[0.7]">
                          <FormControl>
                            <Input {...field} placeholder="Ramal" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeContact(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
