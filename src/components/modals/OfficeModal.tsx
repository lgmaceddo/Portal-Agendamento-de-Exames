import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { Office } from "@/types/data";

interface OfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (office: Omit<Office, "id"> & { id?: string }) => void;
  office?: Office;
}

// Helper para detectar gênero e formatar nome
const formatProfessionalName = (name: string, gender: 'masculino' | 'feminino'): string => {
    if (!name.trim()) return "";
    
    // Remove prefixos existentes para evitar duplicidade
    let cleanName = name.replace(/^DR\.?\s*/i, '').replace(/^DRA\.?\s*/i, '').trim().toUpperCase();
    
    if (!cleanName) return "";
    
    const prefix = gender === "masculino" ? "DRº. " : "DRª. ";
    
    return `${prefix}${cleanName}`;
};

export const OfficeModal = ({ isOpen, onClose, onSave, office }: OfficeModalProps) => {
  const [name, setName] = useState("");
  const [ramal, setRamal] = useState("");
  const [schedule, setSchedule] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [attendants, setAttendants] = useState<Array<{ id: string; name: string; username: string; shift: string }>>([]);
  const [professionals, setProfessionals] = useState<Array<{ name: string; specialty: string; gender: 'masculino' | 'feminino'; actuationDescription?: string }>>([]);
  const [newProfessionalName, setNewProfessionalName] = useState("");
  const [newProfessionalSpecialty, setNewProfessionalSpecialty] = useState("");
  const [newProfessionalGender, setNewProfessionalGender] = useState<'masculino' | 'feminino'>('masculino');
  const [newProfessionalActuation, setNewProfessionalActuation] = useState(""); // NOVO ESTADO
  const [procedures, setProcedures] = useState<string[]>([]);
  const [procedureInput, setProcedureInput] = useState("");

  useEffect(() => {
    if (office) {
      setName(office.name);
      setRamal(office.ramal);
      setSchedule(office.schedule);
      setSpecialties(office.specialties);
      setAttendants(office.attendants);
      // Mapeia profissionais existentes para incluir os campos internos
      setProfessionals(office.professionals.map(p => ({
          ...p,
          gender: (p as any).gender || 'masculino',
          actuationDescription: p.actuationDescription || "" // Carrega a descrição
      })));
      setProcedures(office.procedures);
    } else {
      setName("");
      setRamal("");
      setSchedule("");
      setSpecialties([]);
      setAttendants([]);
      setProfessionals([]);
      setProcedures([]);
    }
    // Reset new professional fields
    setNewProfessionalName("");
    setNewProfessionalSpecialty("");
    setNewProfessionalGender('masculino');
    setNewProfessionalActuation(""); // Reset NOVO CAMPO
  }, [office, isOpen]);

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()].sort());
      setSpecialtyInput("");
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  const handleAddAttendant = () => {
    setAttendants([
      ...attendants,
      { id: Date.now().toString(), name: "", username: "", shift: "Manhã" },
    ]);
  };

  const handleUpdateAttendant = (index: number, field: string, value: string) => {
    const updated = [...attendants];
    updated[index] = { ...updated[index], [field]: value };
    setAttendants(updated);
  };

  const handleRemoveAttendant = (index: number) => {
    setAttendants(attendants.filter((_, i) => i !== index));
  };

  const handleAddProfessional = () => {
    if (newProfessionalName.trim() && newProfessionalSpecialty.trim()) {
        const formattedName = formatProfessionalName(newProfessionalName, newProfessionalGender);

        setProfessionals([...professionals, { 
            name: formattedName, 
            specialty: newProfessionalSpecialty,
            gender: newProfessionalGender,
            actuationDescription: newProfessionalActuation.trim() // Salva a descrição
        }].sort((a, b) => a.name.localeCompare(b.name)));

        setNewProfessionalName("");
        setNewProfessionalSpecialty("");
        setNewProfessionalGender('masculino');
        setNewProfessionalActuation(""); // Limpa o campo
    }
  };

  const handleRemoveProfessional = (index: number) => {
    setProfessionals(professionals.filter((_, i) => i !== index));
  };

  const handleAddProcedure = () => {
    if (procedureInput.trim()) {
      setProcedures([...procedures, procedureInput.trim()]);
      setProcedureInput("");
    }
  };

  const handleRemoveProcedure = (index: number) => {
    setProcedures(procedures.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim() || !ramal.trim() || !schedule.trim()) {
      return;
    }

    // Limpa os dados dos profissionais antes de salvar, removendo o campo 'gender' que é apenas interno do modal
    const cleanedProfessionals = professionals.map(({ name, specialty, actuationDescription }) => ({ name, specialty, actuationDescription }));

    const officeData = {
      ...(office?.id && { id: office.id }),
      name: name.trim(),
      ramal: ramal.trim(),
      schedule: schedule.trim(),
      specialties,
      attendants: attendants.filter(a => a.name.trim() && a.username.trim()),
      professionals: cleanedProfessionals,
      procedures,
    };

    onSave(officeData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{office ? "Editar Consultório" : "Novo Consultório"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: 1° Andar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ramal" className="font-bold">Ramal *</Label>
              <Input
                id="ramal"
                value={ramal}
                onChange={(e) => setRamal(e.target.value)}
                placeholder="Ex: 1010"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule" className="font-bold">Horário *</Label>
              <Input
                id="schedule"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Ex: 08:00 - 18:00"
              />
            </div>
          </div>

          {/* Especialidades */}
          <div className="space-y-2 border p-4 rounded-lg bg-muted/20">
            <Label className="font-bold text-primary">Especialidades do Consultório</Label>
            <div className="flex gap-2">
              <Input
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                placeholder="Digite uma especialidade"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSpecialty())}
              />
              <Button type="button" onClick={handleAddSpecialty} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {specialties.map((specialty, index) => (
                <div
                  key={index}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {specialty}
                  <button onClick={() => handleRemoveSpecialty(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Profissionais */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-bold">Profissionais</Label>
              <Button type="button" onClick={handleAddProfessional} size="sm" variant="outline" disabled={!newProfessionalName.trim() || !newProfessionalSpecialty.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
            
            {/* Input para Novo Profissional */}
            <div className="grid grid-cols-1 gap-2 p-3 border rounded-lg bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="space-y-1">
                        <Label className="text-xs">Gênero</Label>
                        <Select
                            value={newProfessionalGender}
                            onValueChange={(value: 'masculino' | 'feminino') => setNewProfessionalGender(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Gênero" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="masculino">Masculino (DRº.)</SelectItem>
                                <SelectItem value="feminino">Feminino (DRª.)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs">Nome</Label>
                        <Input
                            placeholder="Nome do Profissional"
                            value={newProfessionalName}
                            onChange={(e) => setNewProfessionalName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Especialidade</Label>
                        <Select
                            value={newProfessionalSpecialty}
                            onValueChange={setNewProfessionalSpecialty}
                            disabled={specialties.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={specialties.length > 0 ? "Selecione a Especialidade" : "Adicione especialidades primeiro"} />
                            </SelectTrigger>
                            <SelectContent>
                                {specialties.map((specialty, index) => (
                                    <SelectItem key={index} value={specialty}>
                                        {specialty}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                {/* Novo campo de descrição da atuação */}
                <div className="space-y-1 mt-2">
                    <Label className="text-xs">Descrição da Atuação (ex: Especialista em arritmias)</Label>
                    <Input
                        placeholder="Descrição da atuação"
                        value={newProfessionalActuation}
                        onChange={(e) => setNewProfessionalActuation(e.target.value)}
                    />
                </div>
                
                <Button 
                    type="button" 
                    onClick={handleAddProfessional} 
                    className="bg-primary hover:bg-primary/90 mt-2"
                    disabled={!newProfessionalName.trim() || !newProfessionalSpecialty.trim()}
                >
                    Adicionar Profissional
                </Button>
            </div>

            {/* Lista de Profissionais Cadastrados */}
            {professionals.length > 0 && (
                <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Profissionais Cadastrados:</p>
                    {professionals.map((professional, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground truncate">
                                    {professional.name} 
                                    {professional.actuationDescription && (
                                        <span className="text-primary font-semibold ml-2 text-sm">
                                            {'=>'} {professional.actuationDescription.toUpperCase()}
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveProfessional(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Atendentes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-bold">Atendentes</Label>
              <Button type="button" onClick={handleAddAttendant} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
            {attendants.map((attendant, index) => (
              <div key={attendant.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg bg-muted/20">
                <Input
                  placeholder="Nome"
                  value={attendant.name}
                  onChange={(e) => handleUpdateAttendant(index, "name", e.target.value)}
                />
                <Input
                  placeholder="Usuário"
                  value={attendant.username}
                  onChange={(e) => handleUpdateAttendant(index, "username", e.target.value)}
                />
                <Select
                  value={attendant.shift}
                  onValueChange={(value) => handleUpdateAttendant(index, "shift", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Integral">Integral</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAttendant(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Procedimentos */}
          <div className="space-y-2">
            <Label className="font-bold">Procedimentos Realizados no Setor</Label>
            <div className="flex gap-2">
              <Input
                value={procedureInput}
                onChange={(e) => setProcedureInput(e.target.value)}
                placeholder="Digite um procedimento"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddProcedure())}
              />
              <Button type="button" onClick={handleAddProcedure} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {procedures.map((procedure, index) => (
                <div
                  key={index}
                  className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {procedure}
                  <button onClick={() => handleRemoveProcedure(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Consultório
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};