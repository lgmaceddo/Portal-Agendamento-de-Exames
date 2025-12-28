import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2, Check } from "lucide-react";
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
import { recadoItemSchema, RecadoItemFormData } from "@/schemas/recadoSchema";
import { RecadoCategory, RecadoItem } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecadoItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RecadoItemFormData) => void;
  categories: RecadoCategory[];
  editingItem?: RecadoItem & { categoryId: string };
}

const availableFields = [
    { key: 'paciente', label: 'Nome do Paciente' },
    { key: 'medico', label: 'Dr(a). Solicitante' },
    { key: 'guia', label: 'Guia' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'carteirinha', label: 'Carteirinha' },
    { key: 'idade', label: 'Idade' },
    { key: 'exame', label: 'Exame(s)' },
    { key: 'procedimento', label: 'Procedimento' },
];

// Assinatura padrão
const SIGNATURE = 'Obrigado!\n[nome] / Agendamento';
const SIGNATURE_REGEX = /Obrigado!\s*\[nome\] \/ Agendamento/i;

export const RecadoItemModal = ({
  open,
  onClose,
  onSave,
  categories,
  editingItem,
}: RecadoItemModalProps) => {
  const { toast } = useToast();
  const [fieldInput, setFieldInput] = useState("");

  const form = useForm<RecadoItemFormData>({
    resolver: zodResolver(recadoItemSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
      fields: [],
    },
  });

  const fields = form.watch('fields');
  const content = form.watch('content');

  useEffect(() => {
    if (open && editingItem) {
      form.reset({
        title: editingItem.title,
        content: editingItem.content,
        categoryId: editingItem.categoryId,
        fields: editingItem.fields,
      });
    } else if (open && !editingItem) {
      // Ao criar novo item, define a assinatura como conteúdo inicial
      form.reset({
        title: "",
        content: SIGNATURE, // Define a assinatura como padrão
        categoryId: categories[0]?.id || "",
        fields: [],
      });
    }
  }, [open, editingItem, categories, form]);

  // Lógica para adicionar/remover automaticamente o placeholder ao conteúdo
  useEffect(() => {
    if (!open) return;

    let currentContent = form.getValues('content');
    let contentChanged = false;
    
    // 1. Separar o conteúdo: Texto Inicial, Bloco de Dados, Assinatura
    const signatureMatch = currentContent.match(SIGNATURE_REGEX);
    
    let initialText = currentContent;
    let dataBlock = "";
    
    if (signatureMatch) {
        // O conteúdo é dividido em três partes: antes da assinatura, a assinatura, e o que vier depois (que deve ser ignorado)
        const contentBeforeSignature = currentContent.substring(0, signatureMatch.index).trim();
        
        // Tenta encontrar o último bloco de texto antes da assinatura que não contém placeholders
        const parts = contentBeforeSignature.split('\n\n');
        
        if (parts.length > 1) {
            // Assume que o bloco de dados é o último bloco antes da assinatura
            dataBlock = parts.pop()?.trim() || "";
            initialText = parts.join('\n\n').trim();
        } else {
            // Se não há quebras de linha duplas, o bloco de dados pode estar misturado ou não existir
            initialText = contentBeforeSignature;
        }
    } else {
        // Se não encontrou a assinatura, usa o conteúdo como texto inicial
        initialText = currentContent.trim();
    }

    // 2. Reconstruir o Bloco de Dados (dataBlock) com base nos campos selecionados (fields)
    const newFieldLines: string[] = [];
    const fieldMap = new Map(availableFields.map(f => [f.key, f.label]));
    
    fields.forEach(fieldKey => {
        const fieldLabel = fieldMap.get(fieldKey) || fieldKey;
        const placeholder = `[${fieldKey}]`;
        newFieldLines.push(`${fieldLabel}: ${placeholder}`);
    });

    const newFieldBlock = newFieldLines.join('\n');
    
    // 3. Verificar se o bloco de dados mudou
    const currentFieldBlock = dataBlock.split('\n').filter(line => line.includes('[') && line.includes(']')).join('\n');
    
    if (newFieldBlock !== currentFieldBlock) {
        contentChanged = true;
    }

    if (contentChanged) {
        let finalContent = initialText;
        
        if (newFieldBlock.trim().length > 0) {
            // Adiciona o bloco de dados, garantindo uma linha em branco após o texto inicial
            finalContent += '\n\n' + newFieldBlock;
        }
        
        // Adiciona a assinatura, garantindo uma linha em branco antes dela
        finalContent += '\n\n' + SIGNATURE;

        // 4. Limpar linhas vazias duplicadas e atualizar o campo
        const cleanedLines = finalContent.split('\n').filter((line, index, arr) => {
            // Remove linhas vazias, exceto se for para separar blocos (máximo de uma linha vazia entre blocos)
            if (line.trim() === '') {
                return !(arr[index - 1] && arr[index - 1].trim() === '');
            }
            return true;
        });
        
        form.setValue('content', cleanedLines.join('\n').trim(), { shouldDirty: true });
    }
  }, [fields, open, form]);


  const handleAddField = (key: string) => {
    const currentFields = form.getValues('fields');
    if (!currentFields.includes(key)) {
        form.setValue('fields', [...currentFields, key], { shouldValidate: true });
    }
  };

  const handleRemoveField = (key: string) => {
    const currentFields = form.getValues('fields');
    form.setValue('fields', currentFields.filter(f => f !== key), { shouldValidate: true });
  };

  const handleSubmit = (data: RecadoItemFormData) => {
    try {
      let finalContent = data.content.trim();
      
      // Garante que a assinatura esteja no final, removendo qualquer ocorrência anterior
      finalContent = finalContent.replace(SIGNATURE_REGEX, '').trim();
      finalContent += '\n\n' + SIGNATURE;

      onSave({ ...data, content: finalContent });
      toast({
        title: "Sucesso!",
        description: editingItem
          ? "Item de recado atualizado com sucesso."
          : "Item de recado criado com sucesso.",
      });
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o item de recado.",
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Item de Recado" : "Adicionar Novo Item de Recado"}
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
                            {cat.title.toUpperCase()}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Recado (Card)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Solicitação de Imagens"
                      {...field}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
                <FormLabel className="font-bold text-primary">Campos Dinâmicos</FormLabel>
                <p className="text-sm text-muted-foreground">Selecione os campos que o usuário precisará preencher para gerar este recado.</p>
                
                <div className="flex flex-wrap gap-2">
                    {availableFields.map(field => {
                        const isSelected = fields.includes(field.key);
                        const orderIndex = fields.indexOf(field.key);
                        
                        return (
                            <Button
                                key={field.key}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => isSelected ? handleRemoveField(field.key) : handleAddField(field.key)}
                                className={cn("h-8 relative pr-4", isSelected && "pl-8")}
                            >
                                {isSelected && (
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-primary-foreground text-primary text-xs font-bold border border-primary/50">
                                        {orderIndex + 1}
                                    </span>
                                )}
                                {field.label}
                            </Button>
                        );
                    })}
                </div>
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo do Recado</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o conteúdo do recado. Use [campo] para inserir os campos dinâmicos selecionados acima. Ex: Nome do Paciente: [paciente]"
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
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary">
                    <p className="font-semibold">Assinatura Padrão (Adicionada Automaticamente):</p>
                    <pre className="whitespace-pre-wrap font-sans text-xs mt-1">{SIGNATURE}</pre>
                  </div>
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
                {editingItem ? "Atualizar" : "Salvar"} Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};