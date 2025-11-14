import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSuperAdmin = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsSuperAdmin(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'super_admin' as any)
          .maybeSingle();
        
        const isSuperAdmin = !!data;

        if (error) {
          console.error('Erro ao verificar super admin:', error);
          setIsSuperAdmin(false);
        } else {
          setIsSuperAdmin(isSuperAdmin);
        }
      } catch (error) {
        console.error('Erro ao verificar super admin:', error);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSuperAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isSuperAdmin, loading };
};
