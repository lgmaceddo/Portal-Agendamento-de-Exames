import { useState, useRef } from "react";
import { Search, X, Upload, FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { TussCode } from "@/types/data";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TussCodesContentProps {
    data: TussCode[];
    onImport: (codes: TussCode[]) => void;
    onClear: () => void;
}

export const TussCodesContent = ({ data, onImport, onClear }: TussCodesContentProps) => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [showClearDialog, setShowClearDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredData = data
        .filter(
            (item) =>
                item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.description.localeCompare(b.description, 'pt-BR'));

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        if (!['pdf', 'csv', 'json'].includes(fileExtension || '')) {
            toast({
                title: "Erro",
                description: "Por favor, selecione um arquivo PDF, CSV ou JSON.",
                variant: "destructive",
            });
            return;
        }

        try {
            if (fileExtension === 'pdf') {
                toast({
                    title: "Atenção",
                    description: "A extração automática de PDF requer configuração adicional. Por favor, converta o PDF para CSV ou JSON.",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Processando...",
                description: "Importando códigos TUSS...",
            });

            const { readFileAsText, parseTussCSV, parseTussJSON } = await import('@/lib/tussParser');
            const fileContent = await readFileAsText(file);

            let extractedCodes: TussCode[] = [];

            if (fileExtension === 'csv') {
                extractedCodes = parseTussCSV(fileContent);
            } else if (fileExtension === 'json') {
                extractedCodes = parseTussJSON(fileContent);
            }

            if (extractedCodes.length === 0) {
                toast({
                    title: "Aviso",
                    description: "Nenhum código válido encontrado no arquivo.",
                    variant: "destructive",
                });
                return;
            }

            onImport(extractedCodes);

            toast({
                title: "Sucesso!",
                description: `${extractedCodes.length} códigos TUSS importados com sucesso.`,
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Erro ao processar o arquivo.",
                variant: "destructive",
            });
        }

        // Limpa o input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCopyCode = (code: string, description: string) => {
        navigator.clipboard.writeText(`${code} - ${description}`);
        toast({
            title: "Copiado!",
            description: "Código TUSS copiado para a área de transferência.",
        });
    };

    const handleExportCSV = () => {
        if (data.length === 0) {
            toast({
                title: "Aviso",
                description: "Não há códigos para exportar.",
                variant: "destructive",
            });
            return;
        }

        const csvContent = [
            "Código,Descrição",
            ...data.map(item => `"${item.code}","${item.description}"`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `codigos_tuss_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        toast({
            title: "Exportado!",
            description: "Códigos TUSS exportados com sucesso.",
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            Códigos TUSS
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Consulte códigos e descrições de procedimentos da tabela TUSS.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {data.length > 0 && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportCSV}
                                    className="h-10"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowClearDialog(true)}
                                    className="h-10 text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Limpar Tudo
                                </Button>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.csv,.json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="h-10 bg-primary hover:bg-primary/90"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Importar Arquivo
                        </Button>
                    </div>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por código ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 bg-muted/30 border-border/60 focus:bg-background transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {data.length > 0 && (
                    <div className="mt-4 text-sm text-muted-foreground">
                        {filteredData.length} de {data.length} códigos
                        {searchTerm && ` encontrados para "${searchTerm}"`}
                    </div>
                )}
            </div>

            {data.length === 0 ? (
                <div className="bg-card rounded-lg shadow-sm border border-border p-12">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-muted/30">
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground">Nenhum código TUSS importado</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Importe um arquivo PDF, CSV ou JSON contendo os códigos TUSS para começar a consultar.
                            </p>
                        </div>
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 bg-primary hover:bg-primary/90"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Importar Primeiro Arquivo
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-32">
                                        Código
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Descrição do Procedimento
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider w-24">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-muted/30 transition-colors group cursor-pointer"
                                            onClick={() => handleCopyCode(item.code, item.description)}
                                        >
                                            <td className="px-6 py-4">
                                                <code className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                                    {item.code}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-foreground">{item.description}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopyCode(item.code, item.description);
                                                        }}
                                                        className="h-8 text-xs text-primary hover:bg-primary/10"
                                                    >
                                                        Copiar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-20 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="h-8 w-8 opacity-20" />
                                                <p className="text-sm">Nenhum código encontrado para "{searchTerm}"</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover todos os {data.length} códigos TUSS importados? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onClear();
                                toast({
                                    title: "Códigos removidos",
                                    description: "Todos os códigos TUSS foram removidos.",
                                });
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Limpar Tudo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
