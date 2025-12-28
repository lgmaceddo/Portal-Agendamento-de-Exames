import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { importExcelData, mergeValueTableItems } from '@/scripts/excelImporter';
import { useData } from '@/contexts/DataContext';
import { ValueTableItem } from '@/types/data';
import { toast } from 'sonner';

interface ImportExcelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PreviewData {
  items: number;
  detectedColumns: string[];
  file: File;
}

export function ImportExcelModal({ open, onOpenChange }: ImportExcelModalProps) {
  const {
    valueTableData,
    valueTableCategories,
    addValueTableCategory,
    setValueTableCategoryItems,
    saveToLocalStorage
  } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação do tipo de arquivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }

    setIsProcessing(true);

    try {
      const { values, stats } = await importExcelData(file);

      console.log('[Import Preview] Colunas detectadas:', stats.detectedColumns);
      console.log('[Import Preview] Exames encontrados:', values.length);

      if (values.length === 0) {
        toast.error('Nenhum exame válido encontrado no arquivo. Verifique se as colunas estão corretas.');
        setIsProcessing(false);
        return;
      }

      setPreview({
        items: values.length,
        detectedColumns: stats.detectedColumns,
        file
      });

      toast.success(`Arquivo processado: ${values.length} exames encontrados`);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar arquivo. Verifique se o formato está correto.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!preview?.file) return;

    setIsProcessing(true);

    try {
      // Reimporta o arquivo para garantir dados frescos
      const { values: importedValues } = await importExcelData(preview.file);

      const GERAL_CATEGORY_ID = 'vt-cat-geral';
      const VIEW_TYPE = 'GERAL';

      // Verifica se a categoria GERAL existe, se não, cria
      const currentCategories = valueTableCategories[VIEW_TYPE] || [];
      const geralExists = currentCategories.some(c => c.id === GERAL_CATEGORY_ID);

      if (!geralExists) {
        addValueTableCategory(VIEW_TYPE, {
          id: GERAL_CATEGORY_ID,
          name: 'GERAL',
          color: '#0d9488'
        });
      }

      // Obtém os itens atuais da categoria GERAL
      const currentData = valueTableData[VIEW_TYPE] || {};
      const existingItems = currentData[GERAL_CATEGORY_ID] || [];

      console.log('[Import] Itens existentes:', existingItems.length);
      console.log('[Import] Itens importados:', importedValues.length);

      // Faz o merge em memória
      const { mergedItems, stats } = mergeValueTableItems(existingItems, importedValues);

      console.log('[Import] Resultado do merge:', stats);
      console.log('[Import] Total após merge:', mergedItems.length);

      // Salva todos os itens de uma vez usando a nova função (que já gerencia o salvamento)
      setValueTableCategoryItems(VIEW_TYPE, GERAL_CATEGORY_ID, mergedItems);

      // Feedback detalhado
      const messages: string[] = [];
      if (stats.added > 0) messages.push(`${stats.added} novos`);
      if (stats.updated > 0) messages.push(`${stats.updated} atualizados`);
      if (stats.unchanged > 0) messages.push(`${stats.unchanged} mantidos`);
      if ((stats as any).removed > 0) messages.push(`${(stats as any).removed} removidos`);

      toast.success(`Importação concluída! ${messages.join(', ')}.`);

      onOpenChange(false);
      setPreview(null);

      // Limpa o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast.error('Erro ao importar dados. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Valores de Exames do Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instruções */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Instruções:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Selecione o arquivo Excel (.xlsx) com os valores dos exames</li>
                  <li>Colunas esperadas: ITEM/CODIGO, DESCRIÇÃO/PROCEDIMENTO, HONORÁRIO MÉDICO/HM, VALOR EXAME/PACOTE CDU</li>
                  <li>Exames existentes (mesmo código) serão <strong>atualizados</strong> (nome e valores)</li>
                  <li>Novos exames serão <strong>adicionados</strong></li>
                  <li>Campos manuais (material, info, honorários diferenciados) são preservados</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Área de upload */}
          <div className="border-2 border-dashed rounded-lg p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">
                  {preview ? 'Arquivo carregado' : 'Selecione o arquivo Excel'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Formato aceito: .xlsx ou .xls
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-upload"
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Escolher Arquivo'}
              </Button>
            </div>
          </div>

          {/* Preview dos dados */}
          {preview && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-sm">Pronto para importar:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {preview.items} exames serão processados</li>
                    <li>• Exames existentes serão atualizados, novos serão adicionados</li>
                  </ul>
                  {preview.detectedColumns.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-primary/10">
                      <p className="text-xs text-muted-foreground">
                        <strong>Colunas detectadas:</strong> {preview.detectedColumns.slice(0, 6).join(', ')}
                        {preview.detectedColumns.length > 6 && ` (+${preview.detectedColumns.length - 6} mais)`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!preview || isProcessing}
            >
              {isProcessing ? 'Importando...' : 'Confirmar Importação'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}