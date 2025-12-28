import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Save, X, Settings } from "lucide-react";
import { Office } from "@/types/data";
import { OfficeModal } from "@/components/modals/OfficeModal";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";
import { useUserRoleContext } from "@/contexts/UserRoleContext";

interface ConsultoriosContentProps {
  data: Office[];
  onAdd: (office: Omit<Office, "id">) => Promise<void>;
  onUpdate: (office: Office) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ConsultoriosContent = ({
  data,
  onAdd,
  onUpdate,
  onDelete,
}: ConsultoriosContentProps) => {
  const { canEdit } = useUserRoleContext();
  const canEditConsultorios = canEdit('consultorios');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | undefined>();
  const [activeOfficeName, setActiveOfficeName] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const { hasUnsavedChanges, saveToLocalStorage } = useData();

  // Agrupar consultórios por nome (andar) e ordenar
  const officeNames = Array.from(new Set(data.map((o) => o.name))).sort();
  
  // Inicializa a aba ativa e a especialidade ativa
  useEffect(() => {
    if (officeNames.length > 0 && (!activeOfficeName || !officeNames.includes(activeOfficeName))) {
      setActiveOfficeName(officeNames[0]);
    }
  }, [officeNames, activeOfficeName]);

  const lowerSearchTerm = searchTerm.toLowerCase();
  
  const filteredData = data
    .filter((office) =>
      office.name.toLowerCase().includes(lowerSearchTerm) ||
      office.ramal.toLowerCase().includes(lowerSearchTerm) ||
      office.schedule.toLowerCase().includes(lowerSearchTerm) ||
      office.specialties.some(s => s.toLowerCase().includes(lowerSearchTerm)) ||
      office.professionals.some(p => p.name.toLowerCase().includes(lowerSearchTerm) || p.specialty.toLowerCase().includes(lowerSearchTerm) || p.actuationDescription?.toLowerCase().includes(lowerSearchTerm)) ||
      office.attendants.some(a => a.name.toLowerCase().includes(lowerSearchTerm) || a.username.toLowerCase().includes(lowerSearchTerm))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // Se houver termo de busca, exibe todos os resultados filtrados.
  // Caso contrário, exibe apenas os consultórios da aba ativa.
  const officesToDisplay = searchTerm ? filteredData : filteredData.filter((o) => o.name === activeOfficeName);

  const handleSave = async (officeData: Omit<Office, "id"> & { id?: string }) => {
    if (!canEditConsultorios) return;
    setIsSaving(true);
    try {
      if (officeData.id) {
        await onUpdate(officeData as Office);
        toast({
          title: "Consultório atualizado",
          description: "As informações foram atualizadas com sucesso.",
        });
      } else {
        await onAdd(officeData);
        toast({
          title: "Consultório criado",
          description: "O consultório foi criado com sucesso.",
        });
      }
      setEditingOffice(undefined);
      setIsModalOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar o consultório.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (office: Office) => {
    setEditingOffice(office);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!canEditConsultorios) return;
    if (confirm("Tem certeza que deseja excluir este consultório?")) {
      try {
        await onDelete(id);
        toast({
          title: "Consultório excluído",
          description: "O consultório foi removido com sucesso.",
        });
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao excluir o consultório.", variant: "destructive" });
      }
    }
  };

  const handleNewOffice = () => {
    setEditingOffice(undefined);
    setIsModalOpen(true);
  };

  const handleSpecialtyClick = (officeId: string, specialty: string) => {
    setActiveSpecialty(prev => ({
        ...prev,
        [officeId]: specialty
    }));
  };

  const renderOfficeCard = (office: Office) => {
    const currentSpecialty = activeSpecialty[office.id] || office.specialties[0];
    
    // Ordena os profissionais por nome (1)
    const professionalsInSpecialty = office.professionals
        .filter(p => p.specialty === currentSpecialty)
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    return (
      <Card key={office.id} className="overflow-hidden border-2 border-border/50">
        {/* Office Header */}
        <CardHeader className="pb-4 pt-4 bg-[#ECFDF5]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-primary">{office.name}</h3>
              <div className="flex gap-4 mt-1 text-sm text-foreground">
                <span>
                  Ramal: <span className="font-semibold">{office.ramal}</span>
                </span>
                <span>
                  Horário: <span className="font-semibold">{office.schedule}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
                    {office.specialties.map((specialty, index) => (
                        <Badge
                            key={index}
                            className="bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium rounded-lg" 
                        >
                            {specialty}
                        </Badge>
                    ))}
              {canEditConsultorios && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(office)}
                    className="h-8 w-8 hover:bg-primary/10"
                    disabled={isSaving}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(office.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Grid de 2 colunas para Profissionais e Atendentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Coluna 1: Profissionais por Especialidade */}
            <div>
              <h4 className="font-bold mb-3 text-lg text-foreground">PROFISSIONAIS</h4>
              
              {/* Navegação por Especialidade */}
              {office.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {office.specialties.map((specialty, index) => (
                    <Button
                      key={index}
                      variant={currentSpecialty === specialty ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-sm",
                        currentSpecialty === specialty 
                            ? "bg-primary hover:bg-primary/90" 
                            : "hover:bg-muted/50 border-primary/50 text-foreground"
                      )}
                      onClick={() => handleSpecialtyClick(office.id, specialty)}
                    >
                      {specialty}
                    </Button>
                  ))}
                </div>
              )}

              {/* Lista de Profissionais */}
              {professionalsInSpecialty.length > 0 ? (
                <div className="space-y-3">
                  {professionalsInSpecialty.map((professional, index) => (
                    <div key={index} className="text-sm">
                      <span 
                        className={cn(
                          "font-bold",
                          // Exibir nomes de profissionais femininos em vermelho
                          (professional as any).gender === 'feminino' ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                        )}
                      >
                        {professional.name.toUpperCase()}
                      </span>
                      {/* Exibir a descrição da atuação no formato (DESCRIÇÃO) */}
                      {professional.actuationDescription && (
                          <span className="text-primary font-semibold ml-2 text-sm">
                              ({professional.actuationDescription.toUpperCase()})
                          </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum profissional cadastrado para esta especialidade.</p>
              )}
            </div>

            {/* Coluna 2: Atendentes */}
            <div>
              <h4 className="font-bold mb-3 text-lg text-foreground">ATENDENTES</h4>
              {office.attendants.length > 0 ? (
                <div className="space-y-2">
                  {office.attendants.map((attendant) => (
                    <div key={attendant.id} className="text-sm">
                      <span className="font-bold text-foreground">
                        {attendant.name.toUpperCase()}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        ({attendant.username}) -{" "}
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          attendant.shift.toLowerCase().includes("manhã") && "text-blue-600",
                          attendant.shift.toLowerCase().includes("tarde") && "text-orange-600",
                          attendant.shift.toLowerCase().includes("integral") && "text-green-600"
                        )}
                      >
                        {attendant.shift}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum atendente cadastrado.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary">CONSULTÓRIOS</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as informações para o {activeOfficeName || 'CDU'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              title="Gerenciar Especialidades (Não implementado)"
              disabled
            >
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Especialidades
            </Button>
            {canEditConsultorios && (
              <Button 
                onClick={handleNewOffice} 
                className="bg-primary hover:bg-primary/90"
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border rounded-md px-3 bg-background max-w-full mt-4">
          <Input
            placeholder="Buscar por andar, profissional, especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
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

        {/* Tabs de Andares - Oculta se houver busca ativa */}
        {!searchTerm && officeNames.length > 0 && (
            <Tabs value={activeOfficeName} onValueChange={setActiveOfficeName} className="w-full mt-4">
                <TabsList className="flex-wrap h-auto justify-start bg-transparent border-b border-border rounded-none p-0">
                    {officeNames.map((name) => (
                        <TabsTrigger 
                            key={name} 
                            value={name}
                            className={cn(
                                "py-3 px-4 text-sm font-medium transition-all data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:rounded-none data-[state=active]:ring-0 data-[state=active]:ring-offset-0",
                                "hover:bg-muted/80 text-muted-foreground"
                            )}
                        >
                            {name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        )}
      </div>

      <div className="space-y-4">
        {officesToDisplay.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {searchTerm 
                ? "Nenhum consultório encontrado com o termo de busca." 
                : `Nenhum consultório encontrado para ${activeOfficeName}`
              }
            </CardContent>
          </Card>
        ) : (
          officesToDisplay.map(renderOfficeCard)
        )}
      </div>

      {/* Office Modal */}
      <OfficeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOffice(undefined);
        }}
        onSave={handleSave}
        office={editingOffice}
      />
      
      {/* Botão de Salvar Flutuante (opcional, mas bom para UX) */}
      {hasUnsavedChanges && (
        <Button
          onClick={() => {
            saveToLocalStorage();
            toast({
              title: "Dados salvos",
              description: "Todas as alterações foram salvas com sucesso!",
            });
          }}
          className="fixed bottom-4 right-4 bg-primary hover:bg-primary/90 shadow-xl"
          size="lg"
        >
          <Save className="h-5 w-5 mr-2" />
          Salvar Alterações Locais
        </Button>
      )}
    </div>
  );
};