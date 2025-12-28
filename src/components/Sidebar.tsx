import { useState } from "react";
import { FileText, TestTube, Phone, DollarSign, Users, Building, Settings, ChevronDown, MessageSquare, Info, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRoleContext } from "@/contexts/UserRoleContext";

interface SidebarProps {
  onNavigate: (section: string, subCategory?: string) => void;
  currentSection: string;
  currentSubCategory: string;
}

export const Sidebar = ({ onNavigate, currentSection, currentSubCategory }: SidebarProps) => {
  const { isAdmin } = useUserRoleContext();
  // Estado para controlar qual seção expansível está aberta
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (item: string) => {
    setExpandedItems(prev =>
      prev.includes(item) ? [] : [item] // Abre o item clicado e fecha todos os outros
    );
  };

  const handleSectionClick = (itemSection: string, isExpandable: boolean, defaultSubCategory?: string) => {
    if (isExpandable) {
      // Se for expansível, apenas alterna o estado de expansão
      toggleExpand(itemSection);
    } else {
      // Se não for expansível, fecha todas as expansões e navega
      setExpandedItems([]);
      onNavigate(itemSection, defaultSubCategory);
    }
  };

  const handleSubItemClick = (parentSection: string, subItem: string) => {
    // Ao clicar em um sub-item, garante que a seção pai esteja expandida e navega
    setExpandedItems([parentSection]);
    onNavigate(parentSection, subItem);
  };

  const menuItems = [
    {
      name: "Scripts",
      icon: FileText,
      section: "scripts",
      expandable: true,
      subItems: ["UNIMED", "CASSI", "PARTICULAR", "ANESTESIA"],
    },
    {
      name: "Exames",
      icon: TestTube,
      section: "exames",
      expandable: false,
      defaultSub: 'GERAL',
    },
    {
      name: "Recados",
      icon: MessageSquare,
      section: "recados",
      expandable: false,
    },
    {
      name: "Anotações",
      icon: Info,
      section: "informacoes",
      expandable: false,
    },
    {
      name: "Contatos",
      icon: Phone,
      section: "contatos",
      expandable: false,
      defaultSub: 'GERAL',
    },
    {
      name: "Tabela de Valores",
      icon: DollarSign,
      section: "valores",
      expandable: false,
    },
    {
      name: "Profissionais",
      icon: Users,
      section: "profissionais",
      expandable: false,
    },
    {
      name: "Consultórios",
      icon: Building,
      section: "consultorios",
      expandable: false,
    },
    // Aba Usuários - visível apenas para admins
    ...(isAdmin ? [{
      name: "Usuários",
      icon: UserCog,
      section: "usuarios",
      expandable: false,
    }] : []),
    {
      name: "Configurações",
      icon: Settings,
      section: "config",
      expandable: false,
    },
  ];

  return (
    <aside className="w-64 bg-card p-4 flex flex-col shadow-lg overflow-y-auto">
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActiveSection = currentSection === item.section;
            const isExpanded = expandedItems.includes(item.section);

            return (
              <li key={item.section}>
                <button
                  onClick={() => handleSectionClick(item.section, item.expandable, item.defaultSub)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 w-full text-left",
                    isActiveSection && !item.expandable
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.expandable && (
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  )}
                </button>
                {item.expandable && isExpanded && (
                  <ul className="pl-6 mt-1 space-y-1">
                    {item.subItems?.map((subItem) => (
                      <li key={subItem}>
                        <button
                          onClick={() => handleSubItemClick(item.section, subItem)}
                          className={cn(
                            "block p-2 rounded-lg text-sm transition-colors duration-200 w-full text-left",
                            isActiveSection && currentSubCategory === subItem
                              ? "font-semibold border border-primary bg-primary/5 text-primary"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {subItem}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};