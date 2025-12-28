import { X, FileText, Image, Download, Info, Clock, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoItem, InfoTag, Attachment } from "@/types/data";
import { cn } from "@/lib/utils";
import { getCategoryBadgeClasses } from "@/lib/categoryColors";

interface InfoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InfoItem;
  tag: InfoTag | undefined;
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.dataUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const isImage = (fileType: string) => fileType.startsWith('image/');

export const InfoDetailsModal = ({
  isOpen,
  onClose,
  item,
  tag,
}: InfoDetailsModalProps) => {
  const tagClasses = tag ? getCategoryBadgeClasses(tag.color) : 'bg-muted text-muted-foreground';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle className="text-3xl font-extrabold text-primary pr-8">
                {item.title}
              </DialogTitle>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </DialogHeader>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground border-b pb-4 mb-6">
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4 text-primary" />
              <Badge className={cn("text-xs font-semibold", tagClasses)}>
                {tag?.name.toUpperCase() || 'SEM ETIQUETA'}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Atualizado em: {item.date}</span>
            </div>
            {item.attachments && item.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{item.attachments.length} Anexo(s)</span>
                </div>
            )}
          </div>

          {/* Content Body */}
          <div className="space-y-6">
            <div className="bg-card p-4 rounded-lg border border-border/50 shadow-inner">
              <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
                {item.content}
              </p>
            </div>

            {/* Attachments Section */}
            {item.attachments && item.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Anexos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        {isImage(att.fileType) ? (
                          <Image className="h-5 w-5 text-blue-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{att.fileName}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(att.size)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownload(att)}
                        className="h-8 text-primary hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 pt-4 border-t flex justify-end">
            <Button variant="outline" onClick={onClose}>
                Fechar
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};