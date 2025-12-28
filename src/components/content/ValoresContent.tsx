import { useState, useEffect } from "react";
import { Plus, FileText, Edit, Trash2, Save, X, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, ValueTableItem } from "@/types/data";
import { ValueModal } from "@/components/modals/ValueModal";
import { ScriptGeneratorModal } from "@/components/modals/ScriptGeneratorModal";
import { ImportExcelModal } from "@/components/modals/ImportExcelModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { useUserRoleContext } from "@/contexts/UserRoleContext";

interface ValoresContentProps {
  categories: Category[];
  data: Record<string, ValueTableItem[]>;
}

export const ValoresContent = ({ categories, data }: ValoresContentProps) => {
  const { canEdit } = useUserRoleContext();
  const canEditValores = canEdit('valores');

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [editingValue, setEditingValue] = useState<ValueTableItem | undefined>();

  const {
    deleteValueTable,
    hasUnsavedChanges,
    saveToLocalStorage
  } = useData();
  const { toast } = useToast();

  // UseEffect para monitorar mudanças nas categorias (importante após substituição total)
  useEffect(() => {
    if (categories.length > 0) {
      // Se a categoria ativa não existe mais ou está vazia, reseta para a primeira
      if (!activeCategory || !categories.find(c => c.id === activeCategory)) {
        setActiveCategory(categories[0].id);
      }
    }
  }, [categories, activeCategory]);

  // Garante que usamos uma categoria válida para acessar os dados
  const currentCategoryLabel = activeCategory || (categories.length > 0 ? categories[0].id : "");
  const items = data[currentCategoryLabel] || [];
  const filteredItems = items.filter(
    (item) =>
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleEdit = (item: ValueTableItem) => {
    setEditingValue(item);
    setIsValueModalOpen(true);
  };

  const handleDelete = async (item: ValueTableItem) => {
    if (!canEditValores) return;
    if (confirm(`Deseja realmente excluir "${item.nome}"?`)) {
      try {
        await deleteValueTable("GERAL", activeCategory, item.id);
        toast({
          title: "Valor excluído",
          description: "O valor foi excluído com sucesso.",
        });
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao excluir o valor.", variant: "destructive" });
      }
    }
  };

  const handleCloseValueModal = () => {
    setIsValueModalOpen(false);
    setEditingValue(undefined);
  };

  const generatePolipectomyInfo = () => {
    return `
⚠️ *Importante:* Caso seja identificada a necessidade de remoção de pólipos durante o exame, ele será convertido para Polipectomia do Esôfago, Estômago e Duodeno.

✅ *Polipectomia do Esôfago, Estômago e Duodeno*

*Valor do Procedimento:* R$ 1.795,00
• O exame por esse valor também é realizado com sedação.
• Em caso de anestesia o valor é informado pela UNIANEST: 📞 (14) 3206-3101 | (14) 3206-9435.

*Materiais e Biópsia*
• Acréscimo de R$ 400,00 a R$ 1.100,00 pelo envio de material para biópsia (de acordo com a quantidade de amostras).
• Acréscimo de formações cobrada por pólipo: R$ 400,00 a R$ 1100,00
`;
  };

  const generateScript = () => {
    const selectedExams = filteredItems.filter((item) => selectedItems.has(item.id));

    if (selectedExams.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum exame selecionado",
        description: "Selecione pelo menos um exame para gerar o script.",
      });
      return;
    }

    let script = "Conforme solicitado, segue as informações sobre os valores na *modalidade Particular*:\n\n";

    let totalHonorario = 0;
    let totalExameCartao = 0;
    let totalMaterialMax = 0;
    let needsPolipectomyInfo = false;

    selectedExams.forEach((exam, index) => {
      const totalExame = exam.honorario + exam.exame_cartao;
      const hasMaterial = exam.material_max && exam.material_max > 0;
      const totalComMaterial = totalExame + (exam.material_max || 0);
      const examNameUpper = exam.nome.toUpperCase();

      // Verifica se precisa adicionar a informação de polipectomia
      if (examNameUpper.includes("ENDOSCOPIA") || examNameUpper.includes("COLONOSCOPIA")) {
        needsPolipectomyInfo = true;
      }

      // Acumula totais
      totalHonorario += exam.honorario;
      totalExameCartao += exam.exame_cartao;
      totalMaterialMax += (exam.material_max || 0);

      script += `✅ *${exam.nome.toUpperCase()}*\n\n`;
      script += `O valor total do procedimento é de ${formatCurrency(totalExame)}, que pode ser pago da seguinte forma:\n\n`;
      script += `• ${formatCurrency(exam.honorario)} no Pix ou Dinheiro (valor referente ao honorário médico)\n`;
      script += `• ${formatCurrency(exam.exame_cartao)} no Cartão de Crédito (à vista).\n\n`;

      if (hasMaterial) {
        const materialRange =
          exam.material_min === exam.material_max
            ? formatCurrency(exam.material_max)
            : `${formatCurrency(exam.material_min)} a ${formatCurrency(exam.material_max)}`;

        script += `*Materiais e Contrastes*\n`;
        script += `• Há um custo adicional e variável para materiais e contrastes, que pode ser de ${materialRange}. O valor exato será determinado pelo profissional durante o exame, de acordo com a quantidade de material utilizado.\n\n`;

        script += `• O custo total do exame (procedimento + materiais) pode chegar a até ${formatCurrency(totalComMaterial)}.\n\n`;
      }

      if (exam.honorarios_diferenciados && exam.honorarios_diferenciados.length > 0) {
        const sortedHonorarios = [...exam.honorarios_diferenciados].sort((a, b) =>
          a.profissional.localeCompare(b.profissional)
        );
        script += `*Observação sobre Honorários:*\n`;
        script += `Caso opte por realizar o exame com um dos profissionais abaixo, o valor do honorário será diferente:\n`;
        sortedHonorarios.forEach((hon) => {
          const prefixo = hon.genero === 'masculino' ? 'DRº' : 'DRª';
          script += `• ${prefixo} ${hon.profissional}: ${formatCurrency(hon.valor)}\n`;
        });
        script += "\n";
      }

      if (index < selectedExams.length - 1) {
        script += "━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
      }
    });

    // Adiciona o resumo total se houver mais de um exame
    if (selectedExams.length > 1) {
      const totalGeral = totalHonorario + totalExameCartao;
      const totalGeralComMaterial = totalGeral + totalMaterialMax;

      script += "========================================\n\n";
      script += `*RESUMO TOTAL (${selectedExams.length} EXAMES)*\n\n`;
      script += `O valor total dos procedimentos é de ${formatCurrency(totalGeral)}, que pode ser pago da seguinte forma:\n\n`;
      script += `• ${formatCurrency(totalHonorario)} no Pix ou Dinheiro (valor referente aos honorários médicos)\n`;
      script += `• ${formatCurrency(totalExameCartao)} no Cartão de Crédito (à vista).\n\n`;

      if (totalMaterialMax > 0) {
        script += `*Materiais e Contrastes (Máximo Acumulado)*\n`;
        script += `• O custo total máximo (procedimentos + materiais) pode chegar a até ${formatCurrency(totalGeralComMaterial)}.\n\n`;
      }
      script += "========================================\n\n";
    }

    // Adiciona a informação de Polipectomia se necessário
    if (needsPolipectomyInfo) {
      script += "\n" + generatePolipectomyInfo() + "\n";
    }

    script += `Para dúvidas sobre valores e condições de pagamento, por favor, entre em contato com nosso setor Financeiro:\n\n`;
    script += `*💬 WhatsApp Financeiro: (14) 99865-9327*\n`;
    script += `*🕒 Horário: Seg a Sex: 7h às 19h | Sáb: 8h às 13h*\n\n`;
    script += `Se precisar de mais informações, fique à vontade para perguntar! Estamos aqui para ajudar! 😊`;

    setGeneratedScript(script);
    setIsScriptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="p-6 bg-card rounded-lg shadow">
          {selectedItems.size === 0 ? (
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-primary">Tabela de Valores</h1>
                <p className="text-muted-foreground mt-1">Gerencie os valores dos exames</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => {
                    saveToLocalStorage();
                    toast({
                      title: "Dados salvos",
                      description: "Todas as alterações foram salvas com sucesso!",
                    });
                  }}
                  size="icon"
                  variant={hasUnsavedChanges ? "default" : "outline"}
                  title={hasUnsavedChanges ? "Salvar Alterações Locais" : "Tudo Salvo"}
                  className="h-9 w-9"
                >
                  <Save className="h-4 w-4" />
                </Button>
                {canEditValores && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsImportModalOpen(true)}
                    >
                      <FileSpreadsheet className="h-5 w-5 mr-2" />
                      Importar Excel
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => setIsValueModalOpen(true)}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Novo Valor
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mb-6 bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex-1 mr-4">
                <h2 className="text-xl font-bold text-primary">
                  {selectedItems.size} {selectedItems.size === 1 ? 'item selecionado' : 'itens selecionados'}
                </h2>
                {selectedItems.size > 0 && (
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-xs font-semibold text-primary/80 sticky top-0 bg-primary/5 py-1">Selecionados:</p>
                    {Object.values(data)
                      .flat()
                      .filter(item => selectedItems.has(item.id))
                      .map(item => (
                        <div key={item.id} className="text-xs text-primary/70 flex items-center gap-1">
                          <span className="h-1 w-1 bg-primary/40 rounded-full" />
                          {item.nome.toUpperCase()}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button className="bg-primary hover:bg-primary/90" onClick={generateScript}>
                  <FileText className="h-5 w-5 mr-2" />
                  Gerar Script
                </Button>
                <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => setSelectedItems(new Set())}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar Seleção
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border rounded-md px-3 bg-card max-w-md mt-4">
          <Input
            type="text"
            placeholder="Buscar por código ou nome do exame..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-card"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-border">
              <thead className="bg-[#ECFDF5]">
                <tr>
                  <th className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(filteredItems.map((item) => item.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                      checked={
                        filteredItems.length > 0 &&
                        filteredItems.every((item) => selectedItems.has(item.id))
                      }
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Código
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Nome do Exame
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Honorário (PIX)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Exame (Cartão)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Material
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Total Exame
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Total c/ Material
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const totalExame = item.honorario + item.exame_cartao;
                    const totalComMaterial = totalExame + (item.material_max || 0);
                    let materialText = "";

                    if (!item.material_max || item.material_max === 0) {
                      materialText = formatCurrency(0);
                    } else if (item.material_min === item.material_max) {
                      materialText = formatCurrency(item.material_max);
                    } else {
                      materialText = `${formatCurrency(item.material_min)} a ${formatCurrency(
                        item.material_max
                      )}`;
                    }

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${selectedItems.has(item.id)
                          ? "bg-primary/5"
                          : "hover:bg-muted/50"
                          }`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleSelection(item.id)}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {item.codigo}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {item.nome}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {formatCurrency(item.honorario)}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {formatCurrency(item.exame_cartao)}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {materialText}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-foreground">
                          {formatCurrency(totalExame)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">
                          {formatCurrency(totalComMaterial)}
                        </td>
                        <td className="px-6 py-4">
                          {canEditValores && (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-muted-foreground">
                      {searchTerm ? "Nenhum exame encontrado." : "Nenhum exame nesta categoria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ValueModal
        isOpen={isValueModalOpen}
        onClose={handleCloseValueModal}
        viewType="GERAL"
        categories={categories}
        editingItem={editingValue}
      />


      <ScriptGeneratorModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        script={generatedScript}
      />

      <ImportExcelModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />
    </div>
  );
};