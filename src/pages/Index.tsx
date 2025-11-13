import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PrinterCard } from "@/components/PrinterCard";
import { SearchBar } from "@/components/SearchBar";
import { VideoTutorial } from "@/components/FAQ/VideoTutorial";
import { TutorialSearch } from "@/components/FAQ/TutorialSearch";
import { AIChat } from "@/components/FAQ/AIChat";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, BookOpen, LogIn, Shield } from "lucide-react";
import { tutorials } from "@/data/tutorials";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tutorialSearchTerm, setTutorialSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [printers, setPrinters] = useState<any[]>([]);
  const [videoGuiaUrl, setVideoGuiaUrl] = useState("");
  const [loadingPrinters, setLoadingPrinters] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const { data, error } = await supabase
          .from('impressoras')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true });

        if (error) throw error;
        setPrinters(data || []);
      } catch (error) {
        console.error('Erro ao buscar impressoras:', error);
        toast({
          title: "Erro ao carregar impressoras",
          description: "Tente novamente mais tarde",
          variant: "destructive"
        });
      } finally {
        setLoadingPrinters(false);
      }
    };

    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('configuracao_site')
          .select('video_guia_universal_url')
          .single();

        if (error) throw error;
        setVideoGuiaUrl(data?.video_guia_universal_url || '');
      } catch (error) {
        console.error('Erro ao buscar configuração:', error);
      }
    };

    fetchPrinters();
    fetchConfig();
  }, [toast]);

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

  const filteredPrinters = printers.filter(printer =>
    printer.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(tutorialSearchTerm.toLowerCase()) ||
    tutorial.description.toLowerCase().includes(tutorialSearchTerm.toLowerCase()) ||
    tutorial.keywords.some(keyword => keyword.toLowerCase().includes(tutorialSearchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="container mx-auto px-4 pt-8 pb-8">
          {/* Header with Logo and Login/Logout */}
          <div className="mb-8 flex justify-between items-center">
            <img 
              src="/lovable-uploads/31bbabfd-0146-4c41-84be-fc271db11663.png"
              alt="Yooga Suporte Logo" 
              className="h-16 md:h-20"
            />
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Button
                    onClick={() => navigate("/admin")}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-muted-foreground">Logado como:</p>
                    <p className="text-xs font-medium text-foreground">{user?.email}</p>
                  </div>
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login Admin
                </Button>
              )}
            </div>
          </div>

          {/* Universal Configuration Video */}
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-elegant overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3 text-center text-foreground">
                  Guia Universal de Configuração
                </h3>
                <div className="aspect-video">
                  <iframe
                    src={videoGuiaUrl || "https://www.youtube.com/watch?v=TLKh-evOW5k"}
                    title="Configuração Guia Universal de Configuração de Impressoras"
                    className="w-full h-full rounded"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Search Bar */}
        <div className="container mx-auto px-4 pb-4">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>

        {/* Printers Grid */}
        <div className="container mx-auto px-4 pb-16">
          {loadingPrinters ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando impressoras...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredPrinters.map((printer) => (
                <PrinterCard
                  key={printer.id}
                  name={printer.nome}
                  videoUrl={printer.video_url}
                  downloadUrl={printer.download_url}
                  networkConnection={printer.conexao_rede}
                  recommendedWindows={printer.windows_recomendado}
                />
              ))}
              {filteredPrinters.length === 0 && searchTerm && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Nenhuma impressora encontrada para "{searchTerm}"</p>
                </div>
              )}
              {printers.length === 0 && !loadingPrinters && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Nenhuma impressora cadastrada ainda.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dúvidas Recorrentes / Observações Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              Dúvidas Recorrentes / Observações
            </h2>
            
            {/* Search Bar for Tutorials */}
            <TutorialSearch searchTerm={tutorialSearchTerm} onSearchChange={setTutorialSearchTerm} />
            
            {/* Tutorials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredTutorials.map((tutorial) => (
                <VideoTutorial
                  key={tutorial.id}
                  id={tutorial.id}
                  title={tutorial.title}
                  description={tutorial.description}
                  videoUrl={tutorial.videoUrl}
                />
              ))}
              {filteredTutorials.length === 0 && tutorialSearchTerm && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Nenhum tutorial encontrado para "{tutorialSearchTerm}"</p>
                </div>
              )}
            </div>
            
            {/* Observations Block */}
            <AIChat />
          </div>
        </div>

        {/* Wiki Floating Button */}
        <a
          href="https://wiki-suporte-yooga.notion.site/Impressoras-Configura-es-e-poss-veis-erros-1d6468d042e84ca88165b482df10b1da#1d6468d042e84ca88165b482df10b1da"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-gradient-primary text-white p-4 rounded-lg shadow-elegant hover:shadow-glow hover:scale-105 transition-smooth z-50 flex items-center gap-2"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-sm font-medium">Wiki</span>
        </a>

        {/* Footer */}
        <footer className="bg-card/60 backdrop-blur-sm border-t border-white/20 py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              © 2025 Yooga Suporte - Drivers de impressoras
            </p>
          </div>
        </footer>
      </div>
  );
};

export default Index;
