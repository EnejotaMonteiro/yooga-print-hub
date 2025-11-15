import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useQuery } from "@tanstack/react-query";
import { UniversalVideoFormDialog } from "@/components/admin/UniversalVideoFormDialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client"; // Importar supabase

const HomePage = () => {
  const [isUniversalVideoDialogOpen, setIsUniversalVideoDialogOpen] = useState(false);

  const { isAdmin } = useAdmin();

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

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Página Inicial</h1>

      <div className="mb-8 flex flex-col justify-center gap-6 max-w-7xl mx-auto">
        {/* Universal Configuration Video */}
        <div className={cn(
            "bg-card/80 backdrop-blur-sm border border-border/20 rounded-lg shadow-elegant overflow-hidden relative transition-all duration-300 ease-in-out",
            "w-full" // Ocupa a largura total agora
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
      </div>

      {/* Universal Video Edit Dialog */}
      <UniversalVideoFormDialog
        open={isUniversalVideoDialogOpen}
        onOpenChange={setIsUniversalVideoDialogOpen}
        onSuccess={() => {
          // Invalidate site-config query to refetch updated data
          queryClient.invalidateQueries({ queryKey: ["site-config"] });
        }}
      />
    </div>
  );
};

export default HomePage;