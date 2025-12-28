import { useState } from "react";
import { Plus, Phone, Smartphone, Copy, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, ContactItem } from "@/types/data";
import { ContactModal } from "@/components/modals/ContactModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { ContactFormData } from "@/schemas/contactSchema";
import { useUserRoleContext } from "@/contexts/UserRoleContext";

interface ContatosContentProps {
  viewType: string;
  categories: Category[];
  data: Record<string, ContactItem[]>;
}

// ID fixo da categoria GERAL
const GENERAL_CATEGORY_ID = "cont-cat-geral";

export const ContatosContent = ({ viewType, categories, data }: ContatosContentProps) => {
  const { canEdit } = useUserRoleContext();
  const canEditContatos = canEdit('contatos');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<(ContactItem & { categoryId: string }) | undefined>();
  
  const { addContact, updateContact, deleteContact, hasUnsavedChanges, saveToLocalStorage } = useData();
  const { toast } = useToast();

  // A categoria ativa é sempre a GERAL
  const activeCategory = GENERAL_CATEGORY_ID;
  
  const items = data[activeCategory] || [];
  const filteredItems = items.filter(
    (item) =>
      item.setor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ramal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveContact = (formData: ContactFormData) => {
    // Força o categoryId para GERAL, ignorando o valor do formulário se for diferente
    const targetCategoryId = GENERAL_CATEGORY_ID; 

    if (editingContact) {
      updateContact(viewType, targetCategoryId, editingContact.id, {
        setor: formData.setor,
        local: formData.local || "",
        ramal: formData.ramal || "",
        telefone: formData.telefone || "",
        whatsapp: formData.whatsapp || "",
      });
    } else {
      const newContact: ContactItem = {
        id: `c-${Date.now()}`,
        setor: formData.setor,
        local: formData.local || "",
        ramal: formData.ramal || "",
        telefone: formData.telefone || "",
        whatsapp: formData.whatsapp || "",
      };
      addContact(viewType, targetCategoryId, newContact);
    }
    setEditingContact(undefined);
  };

  const handleEditContact = (contact: ContactItem) => {
    // Passa o categoryId GERAL para o modal, mesmo que ele não seja usado para seleção
    setEditingContact({ ...contact, categoryId: activeCategory });
    setContactModalOpen(true);
  };

  const handleDeleteContact = (contactId: string) => {
    if (confirm("Tem certeza que deseja excluir este contato?")) {
      deleteContact(viewType, activeCategory, contactId);
      toast({
        title: "Sucesso!",
        description: "Contato excluído com sucesso.",
      });
    }
  };

  const handleCopyContact = (contact: ContactItem) => {
    const text = `${contact.setor}\nLocal: ${contact.local}\nRamal: ${contact.ramal}\nTelefone: ${contact.telefone}\nWhatsApp: ${contact.whatsapp}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Informações copiadas.",
      variant: "compact",
      duration: 1000,
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Contatos Rápidos</h1>
              <p className="text-muted-foreground mt-1">Gerencie todos os contatos importantes da CDU</p>
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
                title={hasUnsavedChanges ? "Salvar Alterações" : "Tudo Salvo"}
                className="h-9 w-9"
              >
                <Save className="h-4 w-4" />
              </Button>
              {canEditContatos && (
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    setEditingContact(undefined);
                    setContactModalOpen(true);
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Contato
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border rounded-md px-3 bg-card max-w-md mt-4">
          <Input
            type="text"
            placeholder="Buscar contatos por setor, local, ramal..."
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
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-[#ECFDF5]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Setor
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Local
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ramal
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {item.setor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {item.local}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-semibold">
                      {item.ramal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground/60" />
                        <span className="font-semibold">{item.telefone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      <div className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-semibold">{item.whatsapp}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopyContact(item)}
                          title="Copiar"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {canEditContatos && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleEditContact(item)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteContact(item.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {searchTerm ? "Nenhum contato encontrado." : "Nenhum contato cadastrado. Clique em 'Novo Contato' para adicionar."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <ContactModal
        open={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setEditingContact(undefined);
        }}
        onSave={handleSaveContact}
        categories={categories}
        editingContact={editingContact}
      />
    </div>
  );
};