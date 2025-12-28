import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, FileText, Image, Trash2, Download } from "lucide-react";
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
import { infoItemSchema, InfoItemFormData } from "@/schemas/infoSchema";
import { InfoTag, InfoItem, Attachment } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface InfoItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: InfoItemFormData & { id?: string }) => void;
  tags: InfoTag[];
  editingItem?: InfoItem;
}

const MAX_FILE_SIZE_MB = 4; // Limite de 4MB por arquivo para localStorage

export const InfoItemModal = ({
  open,
  onClose,
  onSave,
  tags,
  editingItem,
}: InfoItemModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const form = useForm<InfoItemFormData>({
    resolver: zodResolver(infoItemSchema),
    defaultValues: {
      title: "",
      content: "",
      tagId: "",
      attachments: [],
    },
  });

  useEffect(() => {
    if (open && editingItem) {
      form.reset({
        title: editingItem.title,
        content: editingItem.content,
        tagId: editingItem.tagId,
        attachments: editingItem.attachments,
      });
      setAttachments(editingItem.attachments || []);
    } else if (open && !editingItem) {
      form.reset({
        title: "",
        content: "",
        tagId: tags[0]?.id || "",
        attachments: [],
      });
      setAttachments([]);
    }
  }, [open, editingItem, tags, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({
            title: "Arquivo muito grande",
            description: `O tamanho máximo permitido é ${MAX_FILE_SIZE_MB}MB.`,
            variant: "destructive",
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newAttachment: Attachment = {
        id: `att-${Date.now()}`,
        fileName: file.name,
        fileType: file.type,
        dataUrl: dataUrl,
        size: file.size,
      };
      setAttachments(prev => [...prev, newAttachment]);
      toast({
        title: "Anexo adicionado",
        description: `${file.name} pronto para ser salvo.`,
      });
    };
    reader.readAsDataURL(file);
    
    // Limpar input para permitir upload do mesmo arquivo novamente
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveAttachment = (id: string) => {
      setAttachments(prev => prev.filter(att => att.id !== id));
      toast({
        title: "Anexo removido",
        description: "O anexo foi removido da lista.",
        variant: "destructive",
      });
  };

  const handleSubmit = (data: InfoItemFormData) => {
    try {
      const finalData: InfoItemFormData & { id?: string } = {
        ...data,
        id: editingItem?.id,
        attachments: attachments,
      };

      onSave(finalData);
      form.reset();
      setAttachments([]);
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a informação.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setAttachments([]);
    onClose();
  };
  
  const isImage = (fileType: string) => fileType.startsWith('image/');
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Informação/Regra" : "Adicionar Nova Informação/Regra"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tagId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiqueta (Categoria)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma etiqueta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tags.length > 0 ? (
                        tags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.name.toUpperCase()}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Crie uma etiqueta primeiro
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
                  <FormLabel>Título da Regra/Procedimento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Regra de Agendamento de Ressonância"
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo Detalhado (Use quebras de linha para formatar)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a regra ou procedimento detalhadamente..."
                      rows={10}
                      {...field}
                      maxLength={10000}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    {field.value.length}/10000 caracteres
                  </p>
                </FormItem>
              )}
            />
            
            <Separator />
            
            {/* Seção de Anexos */}
            <div className="space-y-3">
                <FormLabel className="font-bold text-primary">Anexos (Imagens e Documentos)</FormLabel>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*, .pdf, .doc, .docx, .xls, .xlsx"
                />
                
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Anexo (Máx. {MAX_FILE_SIZE_MB}MB)
                </Button>
                
                {attachments.length > 0 && (
                    <div className="space-y-2 pt-2">
                        <p className="text-sm font-medium text-muted-foreground">Anexos prontos para salvar:</p>
                        {attachments.map(att => (
                            <div key={att.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    {isImage(att.fileType) ? (
                                        <Image className="h-5 w-5 text-blue-500" />
                                    ) : (
                                        <FileText className="h-5 w-5 text-green-500" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium truncate max-w-xs">{att.fileName}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(att.size)}</p>
                                    </div>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleRemoveAttachment(att.id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={tags.length === 0}
              >
                {editingItem ? "Atualizar" : "Salvar"} Informação
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};