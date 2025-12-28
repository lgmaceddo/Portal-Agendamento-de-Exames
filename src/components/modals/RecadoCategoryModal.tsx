import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { recadoCategorySchema, RecadoCategoryFormData } from "@/schemas/recadoSchema";
import { RecadoCategory } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface RecadoCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<RecadoCategory, "id"> | RecadoCategory) => void;
  onEdit: (category: RecadoCategory) => void;
  onDelete: (categoryId: string) => void;
  categories: RecadoCategory[];
  category?: RecadoCategory;
}

export const RecadoCategoryModal = ({ isOpen, onClose, onSave, onEdit, onDelete, categories, category }: RecadoCategoryModalProps) => {
  const { toast } = useToast();
  const [newAttendantName, setNewAttendantName] = useState("");
  const [newAttendantNick, setNewAttendantNick] = useState("");

  const form = useForm<RecadoCategoryFormData>({
    resolver: zodResolver(recadoCategorySchema),
    defaultValues: {
      title: "",
      description: "",
      destinationType: "attendant",
      groupName: "",
      attendants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attendants",
  });

  const destinationType = form.watch("destinationType");

  useEffect(() => {
    if (isOpen) {
      if (category) {
        form.reset({
          title: category.title,
          description: category.description,
          destinationType: category.destinationType,
          groupName: category.groupName || "",
          attendants: category.attendants || [],
        });
      } else {
        form.reset({
          title: "",
          description: "",
          destinationType: "attendant",
          groupName: "",
          attendants: [],
        });
      }
      setNewAttendantName("");
      setNewAttendantNick("");
    }
  }, [isOpen, category, form]);

  const handleAddAttendant = () => {
    if (!newAttendantName.trim() || !newAttendantNick.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha o nome e o nick do atendente.",
      });
      return;
    }
    append({ id: `att-${Date.now()}`, name: newAttendantName, chatNick: newAttendantNick });
    setNewAttendantName("");
    setNewAttendantNick("");
  };

  const handleSubmit = (data: RecadoCategoryFormData) => {
    const finalData: Omit<RecadoCategory, "id"> = {
      title: data.title,
      description: data.description,
      destinationType: data.destinationType,
      attendants: data.destinationType === 'attendant' ? data.attendants : undefined,
      groupName: data.destinationType === 'group' ? data.groupName : undefined,
    };

    if (category) {
      onSave({ ...category, ...finalData });
    } else {
      onSave(finalData);
    }
    onClose();
  };

  const handleCancelEdit = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias de Recados</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 border-b pb-6">
                    <h3 className="text-lg font-semibold text-primary">
                        {category ? "Editar Categoria" : "Nova Categoria"}
                    </h3>
                    
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome da Categoria</FormLabel>
                            <FormControl><Input {...field} placeholder="Ex: Solicitação de Guias" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl><Textarea {...field} placeholder="Descreva o propósito desta categoria de recados" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="destinationType" render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Destinatário:</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="attendant" /></FormControl><FormLabel className="font-normal">Atendentes (Individual)</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="group" /></FormControl><FormLabel className="font-normal">Grupo (Geral)</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    {destinationType === 'group' && (
                        <FormField control={form.control} name="groupName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Grupo</FormLabel>
                                <FormControl><Input {...field} placeholder="Ex: Grupo Autorização" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                    {destinationType === 'attendant' && (
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                                <FormLabel>Adicionar Atendente</FormLabel>
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <Label className="text-xs">Nome</Label>
                                        <Input value={newAttendantName} onChange={(e) => setNewAttendantName(e.target.value)} placeholder="Nome do Atendente" />
                                    </div>
                                    <div className="flex-1">
                                        <Label className="text-xs">Nick do Chat</Label>
                                        <Input value={newAttendantNick} onChange={(e) => setNewAttendantNick(e.target.value)} placeholder="Nick" />
                                    </div>
                                    <Button type="button" size="icon" onClick={handleAddAttendant} className="bg-primary hover:bg-primary/90">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            {fields.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Atendentes Cadastrados:</p>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                            <p className="flex-1 text-sm font-medium">{field.name}</p>
                                            <p className="flex-1 text-sm text-muted-foreground">{field.chatNick}</p>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {form.formState.errors.groupName && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.groupName.message}</p>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        {category && (
                            <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancelar Edição</Button>
                        )}
                        <Button type="submit">
                            {category ? "Atualizar Categoria" : "Salvar Nova Categoria"}
                        </Button>
                    </div>
                </form>
            </Form>

            <Separator />

            <div>
                <h3 className="text-lg font-semibold text-primary mb-4">
                    Categorias Existentes
                </h3>
                <div className="space-y-2">
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-foreground">
                                        {cat.title.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {cat.destinationType === 'group' ? `Destino: Grupo (${cat.groupName})` : `Destino: Atendentes (${cat.attendants?.length || 0})`}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onEdit(cat)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" /> Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onDelete(cat.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
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