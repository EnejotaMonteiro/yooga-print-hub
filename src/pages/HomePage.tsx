import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import YoogaYoutubeBanner from "@/assets/yooga-youtube-banner.png"; // Importar a imagem do banner

const HomePage = () => {
  const videoGuiaUrl = 'https://www.youtube.com/embed/TLKh-evOW5k';
  const guiaTitle = 'Guia Universal de Configuração';
  const guiaDescription = 'Assista ao vídeo para um guia completo de configuração de impressoras.';

  // Detalhes do Canal do YouTube
  const youtubeChannelUrl = 'https://www.youtube.com/@YoogaGestãoSuave';
  const youtubeChannelBanner = YoogaYoutubeBanner; // Usar a imagem importada
  const youtubeChannelTitle = 'Nosso Canal no YouTube';
  const youtubeChannelDescription = 'Explore mais vídeos, tutoriais e dicas sobre nossos produtos e soluções para otimizar seu negócio.';

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Página Inicial</h1>

      <div className="mb-8 flex flex-col justify-center gap-6 max-w-7xl mx-auto">
        {/* Universal Configuration Video */}
        <div className={cn(
            "bg-card/80 backdrop-blur-sm border border-border/20 rounded-lg shadow-elegant overflow-hidden relative transition-all duration-300 ease-in-out",
            "w-full"
        )}>
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
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              {guiaTitle}
            </h2>
            <p className="text-muted-foreground mb-4">
              {guiaDescription}
            </p>
          </div>
        </div>

        {/* Novo campo: Nosso Canal no YouTube */}
        <div className={cn(
            "bg-card/80 backdrop-blur-sm border border-border/20 rounded-lg shadow-elegant overflow-hidden relative transition-all duration-300 ease-in-out",
            "w-full"
        )}>
          <div className="aspect-video">
            <img
              src={youtubeChannelBanner}
              alt={youtubeChannelTitle}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              {youtubeChannelTitle}
            </h2>
            <p className="text-muted-foreground mb-4">
              {youtubeChannelDescription}
            </p>
            <a href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-primary hover:opacity-90 transition-smooth">
                Ver Canal no YouTube
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;