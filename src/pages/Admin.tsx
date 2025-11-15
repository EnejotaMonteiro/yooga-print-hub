import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Home, Image } from "lucide-react"; // Adicionado Image
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PrintersList } from "@/components/admin/PrintersList";
import { PrinterFormDialog } from "@/components/admin/PrinterFormDialog";
import { UserRolesList } from "@/components/admin/UserRolesList";
import { TutorialsList } from "@/components/admin/TutorialsList";
import { TutorialFormDialog } from "@/components/admin/TutorialFormDialog";
import { SuggestionsList } from "@/components/admin/SuggestionsList";
import { LogoSettingsDialog } from "@/components/admin/LogoSettingsDialog"; // Importar o novo componente
import { useQueryClient } from "@tanstack/react-query";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addTutorialDialogOpen, setAddTutorialDialogOpen] = useState(false);
  const [logoSettingsDialogOpen, setLogoSettingsDialogOpen] = useState(false); // Novo estado para o diálogo de logos

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar esta área",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate, toast]);

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

  const handleTutorialSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["tutorials"] });
    queryClient.invalidateQueries({ queryKey: ["admin-tutorials"] });
    setAddTutorialDialogOpen(false);
  };

  const handleLogoSettingsSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["site-config"] }); // Invalidar para atualizar logos
    setLogoSettingsDialogOpen(false);
  };

  const getUsernameFromEmail = (email: string | undefined) => {
    return email ? email.split('@')[0] : 'Usuário';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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
                <p className="text-sm font-medium text-foreground">{getUsernameFromEmail(user?.email)}</p>
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
                onClick={() => setLogoSettingsDialogOpen(true)} // Botão para abrir o diálogo de logos
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Image className="w-4 h-4" />
                Logos
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

          {/* Gerenciar Tutoriais */}
          <div className="bg-card rounded-lg p-6 shadow-elegant">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Gerenciar Tutoriais</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicione, edite ou remova tutoriais de dúvidas recorrentes
                </p>
              </div>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setAddTutorialDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Adicionar Tutorial
              </Button>
            </div>
            <TutorialsList />
          </div>

          {/* Gerenciar Sugestões */}
          <div className="bg-card rounded-lg p-6 shadow-elegant">
            <SuggestionsList />
          </div>
        </div>
      </div>

      <PrinterFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
      />

      <TutorialFormDialog
        open={addTutorialDialogOpen}
        onOpenChange={setAddTutorialDialogOpen}
        onSuccess={handleTutorialSuccess}
      />

      <LogoSettingsDialog
        open={logoSettingsDialogOpen}
        onOpenChange={setLogoSettingsDialogOpen}
        onSuccess={handleLogoSettingsSuccess}
      />
    </div>
  );
};

export default Admin;