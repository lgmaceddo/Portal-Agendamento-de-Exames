import { Bell, MapPin, Phone, MessageCircle, Pencil, UserCircle2, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { HeaderTagModal } from "@/components/modals/HeaderTagModal";
import { HeaderTagInfo } from "@/types/data";
import unimedLogo from "@/assets/unimed-bauru-logo-edited.png";

interface HeaderProps {
  onNotificationClick: () => void;
  notificationCount: number;
}

export const Header = ({ onNotificationClick, notificationCount }: HeaderProps) => {
  const { headerTagData, updateHeaderTag, userName, setUserName } = useData();
  const { theme, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const [editingTag, setEditingTag] = useState<HeaderTagInfo | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleEditClick = (tag: HeaderTagInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTag(tag);
  };

  const handleSaveTag = (updates: Omit<HeaderTagInfo, "id" | "tag">) => {
    if (editingTag) {
      updateHeaderTag(editingTag.id, updates);
    }
  };

  const handleNameClick = () => {
    setTempName(userName || "");
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
      setTempName("");
    }
  };

  return (
    <>
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="w-full px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src={unimedLogo} 
              alt="Unimed Bauru CDU" 
              className="h-12 w-auto object-contain rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
            />
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold">EQUIPE DE AGENDAMENTO CDU</h1>
              <p className="text-sm opacity-90" style={{ color: '#87E1D1' }}>Scripts, fluxos e atualizações em um só lugar.</p>
            </div>
          </div>
          <div className="hidden md:block flex-shrink-0">
            <h2 className="text-2xl font-dancing font-semibold tracking-wide text-white">
              Juntos pelo melhor atendimento!
            </h2>
          </div>
        </div>
        <div className="shadow-md" style={{ backgroundColor: '#0F766E' }}>
          <div className="w-full px-6 py-2 flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all px-3 py-2 rounded-lg">
                  <UserCircle2 className="h-5 w-5 text-primary-foreground" />
                  <Input
                    ref={inputRef}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyDown}
                    className="h-6 w-48 bg-transparent border-none text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-0 p-0"
                    placeholder="Digite seu nome"
                  />
                </div>
              ) : (
                <button
                  onClick={handleNameClick}
                  className="flex items-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all font-medium text-primary-foreground px-3 py-2 rounded-lg"
                >
                  <UserCircle2 className="h-5 w-5" />
                  <span>{userName || "Clique para adicionar seu nome"}</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
                onClick={toggleTheme}
              >
                {theme === "light" ? <Moon className="h-5 w-5 text-primary-foreground" /> : <Sun className="h-5 w-5 text-primary-foreground" />}
              </Button>
              
              <div className="flex space-x-1">
                {headerTagData.map((tagInfo) => (
                  <HoverCard key={tagInfo.id} openDelay={200}>
                    <HoverCardTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all font-medium text-primary-foreground"
                      >
                        {tagInfo.tag}
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      className="w-96 max-h-[420px] p-0 bg-card border-2 border-primary/10 shadow-2xl overflow-hidden flex flex-col" 
                      side="bottom"
                      align="end"
                    >
                      {/* Header do Card com fundo #ECFDF5 */}
                      <div 
                        className="px-5 py-2.5 flex items-center justify-between flex-shrink-0"
                        style={{ backgroundColor: '#ECFDF5' }}
                      >
                        <h3 className="text-[13px] font-bold text-primary uppercase tracking-wider leading-tight pr-2">
                          {tagInfo.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-50 hover:opacity-100 transition-opacity hover:bg-primary/10 rounded-full flex-shrink-0"
                          onClick={(e) => handleEditClick(tagInfo, e)}
                        >
                          <Pencil className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      </div>

                      {/* Separador discreto */}
                      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent flex-shrink-0" />
                      
                      {/* Conteúdo do Card */}
                      <div className="px-5 py-4 space-y-3 overflow-y-auto">
                        {tagInfo.address && (
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-md bg-primary/5 flex-shrink-0">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-[13px] text-foreground/85 leading-relaxed">{tagInfo.address}</span>
                          </div>
                        )}
                        
                        {tagInfo.phones && tagInfo.phones.length > 0 && (
                          <div className="space-y-2.5">
                            {tagInfo.phones.map((phone, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 rounded-md bg-primary/5 flex-shrink-0">
                                  <Phone className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[12px] font-semibold text-foreground/80 uppercase tracking-wide">{phone.label}</div>
                                  <div className="text-[13px] text-foreground/75 mt-0.5">{phone.number}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {tagInfo.whatsapp && (
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-md bg-green-50 flex-shrink-0">
                              <MessageCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-semibold text-foreground/80 uppercase tracking-wide">WhatsApp Geral</div>
                              <div className="text-[13px] text-foreground/75 mt-0.5">{tagInfo.whatsapp}</div>
                            </div>
                          </div>
                        )}
                        
                        {tagInfo.contacts && tagInfo.contacts.length > 0 && (
                          <div className="space-y-0 pt-0.5">
                            {tagInfo.contacts.map((contact, idx) => (
                              <div key={idx} className="flex items-start gap-3 py-2.5 border-t first:border-t-0 border-border/30">
                                <div className="mt-0.5 p-1.5 rounded-md bg-primary/5 flex-shrink-0">
                                  <Phone className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-semibold text-foreground/85">{contact.name}</div>
                                  <div className="text-[12px] text-foreground/65 mt-0.5">
                                    {contact.phone} <span className="text-foreground/50">|</span> Ramal: {contact.ramal}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all text-primary-foreground"
                onClick={onNotificationClick}
              >
                <Bell className="h-5 w-5 text-primary-foreground" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white border-2 border-primary">
                    {notificationCount}
                  </span>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all text-primary-foreground"
                onClick={signOut}
                title={user?.email || 'Sair'}
              >
                <LogOut className="h-5 w-5 text-primary-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {editingTag && (
        <HeaderTagModal
          open={!!editingTag}
          onClose={() => setEditingTag(null)}
          onSave={handleSaveTag}
          tagInfo={editingTag}
        />
      )}
    </>
  );
};