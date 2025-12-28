import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user';

interface UserRoleState {
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
}

export const useUserRole = (): UserRoleState => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
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

    fetchRole();
  }, [user]);

  return {
    role,
    loading,
    isAdmin: role === 'admin',
  };
};

// Função helper para verificar se o usuário pode editar uma seção
export const canEditSection = (isAdmin: boolean, section: string): boolean => {
  // Usuários comuns só podem editar a seção "informacoes"
  if (!isAdmin && section !== 'informacoes') {
    return false;
  }
  return true;
};
