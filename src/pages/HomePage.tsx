import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const HomePage = () => {
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
      </div>
    </div>
  );
};

export default HomePage;