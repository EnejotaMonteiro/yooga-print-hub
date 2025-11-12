import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PrintersList } from "@/components/admin/PrintersList";
import { PrinterFormDialog } from "@/components/admin/PrinterFormDialog";
import { UserRolesList } from "@/components/admin/UserRolesList";
import { useQueryClient } from "@tanstack/react-query";

const Admin = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta área",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [isAdmin, loading, navigate, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["printers"] });
    queryClient.invalidateQueries({ queryKey: ["admin-printers"] });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground">Gerencie impressoras e configurações</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Logado como:</p>
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
              </div>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Página Inicial
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Gerenciar Impressoras */}
          <div className="bg-card rounded-lg p-6 shadow-elegant">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Gerenciar Impressoras</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicione, edite ou remova impressoras do catálogo
                </p>
              </div>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Adicionar Impressora
              </Button>
            </div>
            <PrintersList />
          </div>

          {/* Gerenciar Usuários */}
          <div className="bg-card rounded-lg p-6 shadow-elegant">
            <UserRolesList />
          </div>

          {/* Configurações do Site */}
          <div className="bg-card rounded-lg p-6 shadow-elegant">
            <h2 className="text-xl font-semibold text-foreground mb-4">Configurações do Site</h2>
            <p className="text-muted-foreground">
              Funcionalidade de configurações em desenvolvimento...
            </p>
          </div>
        </div>
      </div>

      <PrinterFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default Admin;
