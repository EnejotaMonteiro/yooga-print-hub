import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const [adminResult, superAdminResult] = await Promise.all([
          supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin',
          }),
          supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'super_admin',
          }),
        ]);

        if (adminResult.error || superAdminResult.error) {
          console.error('Erro ao verificar admin:', adminResult.error || superAdminResult.error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!adminResult.data || !!superAdminResult.data);
        }
      } catch (error) {
        console.error('Erro ao verificar admin:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading };
};
