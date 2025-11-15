import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useQuery } from "@tanstack/react-query";
// Removido: import { UniversalVideoFormDialog } from "@/components/admin/UniversalVideoFormDialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client"; // Importar supabase
import { toast } from "sonner"; // Importar toast do sonner

const HomePage = () => {
  // Removido: const [isUniversalVideoDialogOpen, setIsUniversalVideoDialogOpen] = useState(false);
  // Removido: const { isAdmin } = useAdmin();
  // Removido: const { data: siteConfig, isLoading: loadingSiteConfig } = useQuery({
  // Removido:   queryKey: ["site-config"],
  // Removido:   queryFn: async () => {
  // Removido:     const { data, error } = await supabase
  // Removido:       .from('configuracao_site')
  // Removido:       .select('video_guia_universal_url, titulo_guia_universal, descricao_guia_universal, logo_full_url')
  // Removido:       .single();
  // Removido:     if (error && error.code === 'PGRST116') {
  // Removido:       const defaultLogoUrl = '/lovable-uploads/default-full-logo.png';
  // Removido:       const { data: newConfig, error: insertError } = await supabase
  // Removido:         .from('configuracao_site')
  // Removido:         .insert({
  // Removido:           logo_min_url: defaultLogoUrl,
  // Removido:           logo_full_url: defaultLogoUrl,
  // Removido:           logo_login_url: defaultLogoUrl,
  // Removido:         })
  // Removido:         .select('video_guia_universal_url, titulo_guia_universal, descricao_guia_universal, logo_full_url')
  // Removido:         .single();
  // Removido:       if (insertError) throw insertError;
  // Removido:       return newConfig;
  // Removido:     } else if (error) {
  // Removido:       throw error;
  // Removido:     }
  // Removido:     return data;
  // Removido:   },
  // Removido: });

  const videoGuiaUrl = 'https://www.youtube.com/embed/TLKh-evOW5k';
  const guiaTitle = 'Guia Universal de Configuração';
  const guiaDescription = 'Assista ao vídeo para um guia completo de configuração de impressoras.';

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Página Inicial</h1>

      <div className="mb-8 flex flex-col justify-center gap-6 max-w-7xl mx-auto">
        {/* Universal Configuration Video */}
        <div className={cn(
            "bg-card/80 backdrop-blur-sm border border-border/20 rounded-lg shadow-elegant overflow-hidden relative transition-all duration-300 ease-in-out",
            "w-full" // Ocupa a largura total agora
        )}>
          {/* Removido: isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsUniversalVideoDialogOpen(true)}
              className="absolute top-2 right-2 bg-background/80 hover:bg-background z-10"
              title="Editar vídeo universal"
            >
              <Settings className="w-4 h-4" />
            </Button>
          ) */}
          {/* Removido: loadingSiteConfig ? (
            <div className="aspect-video flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : ( */}
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
          {/* ) */}
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              {guiaTitle}
            </h2>
            <p className="text-muted-foreground mb-4">
              {guiaDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Removido: Universal Video Edit Dialog */}
      {/* Removido: <UniversalVideoFormDialog
        open={isUniversalVideoDialogOpen}
        onOpenChange={setIsUniversalVideoDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["site-config"] });
        }}
      /> */}
    </div>
  );
};

export default HomePage;