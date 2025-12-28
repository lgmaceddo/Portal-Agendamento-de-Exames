import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { FileText, TestTube, Phone, DollarSign, Users, Building, TrendingUp, Activity, Clock, AlertCircle, Download, Upload, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react"; // Importando useState

export const DashboardContent = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false); // Novo estado para controle de loading
  
  const {
    scriptData,
    examData,
    contactData,
    valueTableData,
    professionalData,
    officeData,
    noticeData,
    exportAllData,
    importAllData,
    hasUnsavedChanges,
    saveToLocalStorage,
  } = useData();

  // Calcular estatísticas
  const totalScripts = Object.values(scriptData).reduce(
    (total, categories) =>
      total + Object.values(categories).reduce((sum, items) => sum + items.length, 0),
    0
  );

  const totalExams = Object.values(examData).reduce(
    (total, categories) =>
      total + Object.values(categories).reduce((sum, items) => sum + items.length, 0),
    0
  );

  const totalContacts = Object.values(contactData).reduce(
    (total, categories) =>
      total + Object.values(categories).reduce((sum, items) => sum + items.length, 0),
    0
  );

  const totalValueItems = Object.values(valueTableData).reduce(
    (total, categories) =>
      total + Object.values(categories).reduce((sum, items) => sum + items.length, 0),
    0
  );

  const totalProfessionals = Object.values(professionalData).reduce(
    (total, categories) =>
      total + Object.values(categories).reduce((sum, items) => sum + items.length, 0),
    0
  );

  const statsCards = [
    {
      title: "Scripts",
      value: totalScripts,
      icon: FileText,
      description: "Scripts cadastrados",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Exames",
      value: totalExams,
      icon: TestTube,
      description: "Exames disponíveis",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Contatos",
      value: totalContacts,
      icon: Phone,
      description: "Contatos registrados",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tabela de Valores",
      value: totalValueItems,
      icon: DollarSign,
      description: "Itens de valores",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Profissionais",
      value: totalProfessionals,
      icon: Users,
      description: "Profissionais cadastrados",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Consultórios",
      value: officeData.length,
      icon: Building,
      description: "Consultórios ativos",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  const recentActivities = [
    { action: "Script atualizado", item: "Consulta Particular", time: "Há 2 horas" },
    { action: "Exame adicionado", item: "Ultrassom Abdominal", time: "Há 4 horas" },
    { action: "Contato editado", item: "Recepção CDU", time: "Há 6 horas" },
    { action: "Profissional cadastrado", item: "Dr. Silva", time: "Ontem" },
  ];

  // Calcular porcentagens para o gráfico de uso
  const totalItems = totalScripts + totalExams + totalContacts + totalValueItems + totalProfessionals + officeData.length;
  const scriptsPercentage = totalItems > 0 ? (totalScripts / totalItems) * 100 : 0;
  const examsPercentage = totalItems > 0 ? (totalExams / totalItems) * 100 : 0;


  // Funções de exportação e importação
  const handleExportData = () => {
    try {
      const jsonData = exportAllData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `portal-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportação concluída",
        description: "Todos os dados foram exportados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = await importAllData(jsonData);
        
        if (success) {
          toast({
            title: "Importação concluída",
            description: "Todos os dados foram importados e sincronizados com o banco de dados!",
          });
        } else {
          // Erro já é toastado dentro de importAllData, mas garantimos o fallback
          if (!success) {
             toast({
                title: "Erro na importação",
                description: "O arquivo não possui um formato válido ou ocorreu um erro no servidor.",
                variant: "destructive",
            });
          }
        }
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Não foi possível ler o arquivo.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleImportClick = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };


  const handleSaveData = () => {
    saveToLocalStorage();
    toast({
      title: "Dados salvos",
      description: "Todas as alterações foram salvas com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com Botão de Salvar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do sistema de agendamento</p>
        </div>
        <Button 
          onClick={handleSaveData}
          size="icon"
          variant={hasUnsavedChanges ? "default" : "outline"}
          title={hasUnsavedChanges ? "Salvar Alterações" : "Tudo Salvo"}
          className="h-10 w-10"
        >
          <Save className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-all duration-200 border-2 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Second Row - Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Usage */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5 text-primary" />
              Distribuição de Conteúdo
            </CardTitle>
            <CardDescription>Proporção de dados no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Scripts</span>
                <span className="font-medium">{scriptsPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={scriptsPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exames</span>
                <span className="font-medium">{examsPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={examsPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total de Itens</span>
                <span className="font-medium text-lg">{totalItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Activity className="h-5 w-5 text-primary" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>Últimas atualizações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-b-0 border-border/30">
                  <div className="p-1.5 rounded-md bg-primary/10 mt-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.item}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Alerts and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Alerts */}
        <Card className="lg:col-span-2 border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <AlertCircle className="h-5 w-5 text-primary" />
              Avisos do Sistema
            </CardTitle>
            <CardDescription>Notificações importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {noticeData.slice(0, 3).map((notice) => (
                <div key={notice.id} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{notice.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notice.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-primary">Acesso Rápido</CardTitle>
            <CardDescription>Informações importantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Consultórios Ativos</p>
              <p className="text-2xl font-bold text-primary">{officeData.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Avisos Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">{noticeData.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Sistema</p>
              <p className="text-sm font-semibold text-green-600">✓ Operacional</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Download className="h-5 w-5 text-primary" />
              Exportar Dados
            </CardTitle>
            <CardDescription>Faça backup completo de todos os dados do portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Exporta todos os scripts, exames, contatos, valores, profissionais, consultórios e avisos em formato JSON.
            </p>
            <Button 
              onClick={handleExportData}
              className="w-full"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Todos os Dados
            </Button>
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
              <p className="font-semibold mb-1">O backup incluirá:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>{totalScripts} Scripts</li>
                <li>{totalExams} Exames</li>
                <li>{totalContacts} Contatos</li>
                <li>{totalValueItems} Itens de valores</li>
                <li>{totalProfessionals} Profissionais</li>
                <li>{officeData.length} Consultórios</li>
                <li>{noticeData.length} Avisos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Upload className="h-5 w-5 text-primary" />
              Importar Dados
            </CardTitle>
            <CardDescription>Restaure dados de um backup anterior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Importa todos os dados de um arquivo JSON de backup. Esta ação substituirá os dados existentes no banco de dados.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <Button 
              onClick={handleImportClick}
              className="w-full"
              size="lg"
              variant="outline"
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo JSON
                </>
              )}
            </Button>
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 p-3 rounded-md">
              <p className="font-semibold mb-1">⚠️ Atenção:</p>
              <p>A importação usará os IDs do arquivo para atualizar ou inserir dados no banco. Certifique-se de usar um arquivo de backup válido.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};