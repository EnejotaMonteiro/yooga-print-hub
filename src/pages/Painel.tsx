import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrinterChat } from "@/components/PrinterChat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { printers } from "@/data/printers";

const Painel = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se usuário está logado
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }
        setUser(session.user);
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/31bbabfd-0146-4c41-84be-fc271db11663.png"
              alt="Yooga Suporte Logo" 
              className="h-10"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">Painel de Suporte</h1>
              <p className="text-sm text-muted-foreground">Bem-vindo, {user?.email}</p>
            </div>
          </div>
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Chat de Suporte por Impressora</h2>
          
          <Tabs defaultValue={printers[0]?.id} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
              {printers.map((printer) => (
                <TabsTrigger 
                  key={printer.id} 
                  value={printer.id}
                  className="text-xs lg:text-sm"
                >
                  {printer.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {printers.map((printer) => (
              <TabsContent key={printer.id} value={printer.id}>
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-elegant p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    Chat - {printer.name}
                  </h3>
                  <PrinterChat printerId={printer.id} user={user} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Painel;