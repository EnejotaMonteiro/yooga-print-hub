import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PrinterCard } from "@/components/PrinterCard";
import { SearchBar } from "@/components/SearchBar";
import { SocketStatus } from "@/components/SocketStatus";
import { FAQFloatingButton } from "@/components/FAQFloatingButton";
import { SuggestionsFloatingButton } from "@/components/SuggestionsFloatingButton";
import { WikiFloatingButton } from "@/components/WikiFloatingButton"; // Importar o novo componente WikiFloatingButton
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, LogIn, Shield, Settings, GripVertical, Download, Bot } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAdmin } from "@/hooks/use-admin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PrinterFormDialog } from "@/components/admin/PrinterFormDialog";
import { UniversalVideoFormDialog } from "@/components/admin/UniversalVideoFormDialog";
import { AIChat } from "@/components/FAQ/AIChat";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPrinterForEdit, setSelectedPrinterForEdit] = useState<any>(null);
  const [isUniversalVideoDialogOpen, setIsUniversalVideoDialogOpen] = useState(false);
  const [isDragModeActive, setIsDragModeActive] = useState(false);
  const [showDownloadAllButton, setShowDownloadAllButton] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();

  const { data: printers, isLoading: loadingPrinters } = useQuery({
    queryKey: ["printers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impressoras')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: siteConfig, isLoading: loadingSiteConfig } = useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracao_site')
        .select('video_guia_universal_url, titulo_guia_universal, descricao_guia_universal')
        .single();

      if (error && error.code === 'PGRST116') {
        const defaultVideoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        const defaultTitle = 'Guia Universal de Configuração';
        const defaultDescription = 'Assista ao vídeo para um guia completo de configuração de impressoras.';

        const { data: newConfig, error: insertError } = await supabase
          .from('configuracao_site')
          .insert({
            video_guia_universal_url: defaultVideoUrl,
            titulo_guia_universal: defaultTitle,
            descricao_guia_universal: defaultDescription,
          })
          .select('video_guia_universal_url, titulo_guia_universal, descricao_guia_universal')
          .single();
        if (insertError) throw insertError;
        return newConfig;
      } else if (error) {
        throw error;
      }
      return data;
    },
  });

  const videoGuiaUrl = siteConfig?.video_guia_universal_url || '';
  const guiaTitle = siteConfig?.titulo_guia_universal || 'Guia Universal de Configuração';
  const guiaDescription = siteConfig?.descricao_guia_universal || 'Assista ao vídeo para um guia completo de configuração de impressoras.';

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
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setShowDownloadAllButton(true);
      } else {
        setShowDownloadAllButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  const handleEditPrinter = (printerId: string) => {
    const printerToEdit = printers?.find(p => p.id === printerId);
    if (printerToEdit) {
      setSelectedPrinterForEdit(printerToEdit);
      setEditDialogOpen(true);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !printers) {
      return;
    }

    const reorderedPrinters = Array.from(printers);
    const [removed] = reorderedPrinters.splice(result.source.index, 1);
    reorderedPrinters.splice(result.destination.index, 0, removed);

    const updates = reorderedPrinters.map((p, index) => ({
      id: p.id,
      ordem: index,
    }));

    queryClient.setQueryData(["printers"], reorderedPrinters);

    try {
      for (let i = 0; i < reorderedPrinters.length; i++) {
        const printer = reorderedPrinters[i];
        const { error } = await supabase
          .from('impressoras')
          .update({ ordem: i })
          .eq('id', printer.id);

        if (error) throw error;
      }

      toast({
        title: "Ordem atualizada",
        description: "A ordem das impressoras foi salva com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["printers"] });
    } catch (error: any) {
      console.error('Erro ao reordenar impressoras:', error);
      toast({
        title: "Erro ao reordenar",
        description: error.message || "Ocorreu um erro ao reordenar as impressoras",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["printers"] });
    }
  };

  const filteredPrinters = printers?.filter(printer =>
    printer.nome.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getUsernameFromEmail = (email: string | undefined) => {
    return email ? email.split('@')[0] : 'Usuário';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Logo and Socket Status */}
      <div className="fixed top-4 left-4 z-50 flex flex-col items-start gap-2">
        <img src="/lovable-uploads/31bbabfd-0146-4c41-84be-fc271db11663.png" alt="Yooga Suporte Logo" className="h-16 md:h-20" />
        <SocketStatus />
      </div>

      {/* Fixed top-right controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {showDownloadAllButton && (
          <a 
            href="https://drive.google.com/drive/folders/1-pro0D_-06g22xL_1o2N5UAMCGiRAEol?usp=drive_link" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Todos</span>
            </Button>
          </a>
        )}
        <ThemeToggle />
        {user ? (
          <>
            <Button onClick={() => navigate("/admin")} variant="outline" size="sm" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </>
        ) : (
          <Button onClick={() => navigate("/login")} variant="outline" size="sm" className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Login Admin
          </Button>
        )}
      </div>

      {/* Floating Buttons Container (FAQ, Suggestions, Wiki) */}
      <div className="fixed bottom-6 left-6 z-50 flex space-x-2">
        <div className="relative group">
          <FAQFloatingButton />
        </div>
        <div className="relative group">
          <SuggestionsFloatingButton />
        </div>
        <div className="relative group">
          <WikiFloatingButton wikiUrl="https://wiki-suporte-yooga.notion.site/Impressoras-Configura-es-e-poss-veis-erros-1d6468d042e84ca88165b482df10b1da#1d6468d042e84ca88165b482df10b1da" />
        </div>
      </div>

      {/* Header Section */}
      <div className="w-full px-4 pt-28 pb-8">
          {/* Universal Configuration Video and AI Chat */}
          <div className="mb-8 flex flex-col lg:flex-row justify-center gap-6 max-w-7xl mx-auto">
            {/* Universal Configuration Video */}
            <div className={cn(
                "bg-card/80 backdrop-blur-sm border border-border/20 rounded-lg shadow-elegant overflow-hidden relative transition-all duration-300 ease-in-out",
                showAIChat ? "lg:w-1/2" : "lg:w-full"
            )}>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUniversalVideoDialogOpen(true)}
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background z-10"
                  title="Editar vídeo universal"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              {loadingSiteConfig ? (
                <div className="aspect-video flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                videoGuiaUrl && (
                  <div className="aspect-video">
                    <iframe
                      src={videoGuiaUrl}
                      title="Guia Universal de Configuração"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )
              )}
              <div className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  {guiaTitle}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {guiaDescription}
                </p>
              </div>
            </div>

            {/* AI Chat Button and AI Chat Panel */}
            <div className={cn(
                "flex flex-col gap-6",
                showAIChat ? "lg:w-1/2" : "lg:w-auto"
            )}>
              <Button
                onClick={() => setShowAIChat(prev => !prev)}
                className="group h-10 px-3 rounded-full shadow-md bg-gradient-primary flex items-center gap-2 transition-all hover:scale-105 z-10"
                title={showAIChat ? "Esconder Assistente" : "Mostrar Assistente Rogério"}
              >
                <Bot className="w-5 h-5 text-white" />
                <span className="hidden group-hover:inline-block text-sm font-semibold text-white transition-all duration-300">
                  Assistente Rogério
                </span>
              </Button>

              {showAIChat && (
                <div className="w-full transition-all duration-300 ease-in-out">
                    <AIChat />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar and Drag Mode Toggle */}
        <div className="container mx-auto px-4 pb-4 flex items-center gap-4 justify-center">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          {isAdmin && (
            <Button
              variant={isDragModeActive ? "default" : "outline"}
              size="icon"
              onClick={() => setIsDragModeActive(prev => !prev)}
              title={isDragModeActive ? "Desativar modo de arrastar" : "Ativar modo de arrastar para reordenar"}
            >
              <GripVertical className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Printers Grid */}
        <div className="container mx-auto px-4 pb-16">
          {(loadingPrinters || adminLoading) ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando impressoras...</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="printers-list">
                {(provided) => (
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto printers-droppable-area"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {filteredPrinters.map((printer, index) => (
                      <Draggable 
                        key={printer.id} 
                        draggableId={printer.id} 
                        index={index} 
                        isDragDisabled={!isDragModeActive}
                      >
                        {(provided, snapshot) => (
                          <PrinterCard
                            key={printer.id}
                            id={printer.id}
                            name={printer.nome}
                            videoUrl={printer.video_url}
                            downloadUrl={printer.download_url}
                            networkConnection={printer.conexao_rede}
                            recommendedWindows={printer.windows_recomendado}
                            isAdmin={isAdmin}
                            onEdit={handleEditPrinter}
                            imageUrl={printer.imagem_url || undefined}
                            innerRef={provided.innerRef}
                            draggableProps={provided.draggableProps}
                            dragHandleProps={isDragModeActive ? provided.dragHandleProps : null}
                            isDragModeActive={isDragModeActive}
                            isDragging={snapshot.isDragging}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {filteredPrinters.length === 0 && searchTerm && (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">Nenhuma impressora encontrada para "{searchTerm}"</p>
                      </div>
                    )}
                    {printers?.length === 0 && !loadingPrinters && (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">Nenhuma impressora cadastrada ainda.</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-card/60 backdrop-blur-sm border-t border-border/20 py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              © 2025 Yooga Suporte - Drivers de impressoras
            </p>
          </div>
        </footer>

        {/* Printer Edit Dialog */}
        <PrinterFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          printer={selectedPrinterForEdit}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            setEditDialogOpen(false);
            setSelectedPrinterForEdit(null);
          }}
        />

        {/* Universal Video Edit Dialog */}
        <UniversalVideoFormDialog
          open={isUniversalVideoDialogOpen}
          onOpenChange={setIsUniversalVideoDialogOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["site-config"] });
          }}
        />
    </div>
  );
};
export default Index;