import React from 'react';
import { convertToEmbedUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useVideoPlayer } from '@/contexts/VideoPlayerContext'; // Importar o hook do contexto

interface VideoTutorialProps {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

export const VideoTutorial = ({ id, title, description, videoUrl }: VideoTutorialProps) => {
  const { playVideo } = useVideoPlayer();
  const embedUrl = convertToEmbedUrl(videoUrl);

  // Função para extrair o ID do vídeo do YouTube para a thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  const thumbnailUrl = getYouTubeThumbnail(videoUrl);

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg shadow-elegant overflow-hidden transition-smooth hover:shadow-glow">
      <div className="p-4">
        {/* Thumbnail ou placeholder */}
        <div className="aspect-video mb-4 rounded overflow-hidden relative group">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={`Thumbnail do vídeo ${title}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              Vídeo indisponível
            </div>
          )}
          <Button
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => playVideo(embedUrl, title)}
            aria-label={`Assistir ${title} no mini-player`}
          >
            <Play className="h-10 w-10 text-white" />
          </Button>
        </div>
        
        {/* Título do Tópico */}
        <h4 className="text-lg font-semibold mb-3 text-foreground">
          {title}
        </h4>
        
        {/* Descrição em Texto */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        <Button
          onClick={() => playVideo(embedUrl, title)}
          className="mt-4 w-full bg-gradient-primary hover:opacity-90 transition-smooth"
        >
          <Play className="w-4 h-4 mr-2" />
          Assistir no Mini-Player
        </Button>
      </div>
    </div>
  );
};