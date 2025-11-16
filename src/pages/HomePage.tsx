import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Youtube, Instagram } from "lucide-react"; // Importar ícones do YouTube e Instagram
import { useAdmin } from "@/hooks/use-admin";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const HomePage = () => {
  // Adicionados parâmetros para desativar controles, informações do vídeo e vídeos relacionados
  const videoGuiaUrl = 'https://www.youtube.com/embed/TLKh-evOW5k?controls=0&showinfo=0&modestbranding=1&rel=0';
  const guiaTitle = 'Guia Universal de Configuração';
  const guiaDescription = 'Assista ao vídeo para um guia completo de configuração de impressoras.';

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

            {/* Botões de Redes Sociais */}
            <div className="flex justify-center gap-4 mt-6">
              <a 
                href="https://www.youtube.com/@YoogaGestãoSuave" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-elegant transition-smooth">
                  <Youtube className="w-4 h-4 mr-2" />
                  Nosso Canal
                </Button>
              </a>
              <a 
                href="https://www.instagram.com/yoogatecnologia" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-pink-600 hover:bg-pink-700 text-white shadow-elegant transition-smooth">
                  <Instagram className="w-4 h-4 mr-2" />
                  Nosso Instagram
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;