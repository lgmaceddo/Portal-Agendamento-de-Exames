import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user';

interface UserRoleContextType {
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  canEdit: (section: string) => boolean;
  refetchRole: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const useUserRoleContext = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRoleContext must be used within a UserRoleProvider');
  }
  return context;
};

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async () => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar role:', error);
        setRole('user');
      } else {
        setRole((data?.role as AppRole) || 'user');
      }
    } catch (err) {
      console.error('Erro ao buscar role:', err);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [user]);

  const isAdmin = role === 'admin';

  // Função para verificar se o usuário pode editar uma seção
  const canEdit = (section: string): boolean => {
    // Usuários comuns só podem editar a seção "informacoes"
    if (!isAdmin && section !== 'informacoes') {
      return false;
    }
    return true;
  };

  return (
    <UserRoleContext.Provider value={{ role, loading, isAdmin, canEdit, refetchRole: fetchRole }}>
      {children}
    </UserRoleContext.Provider>
  );
};
