import React from 'react';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const FloatingVideoPlayer = () => {
  const { videoUrl, videoTitle, closeVideo } = useVideoPlayer();

  if (!videoUrl) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-[100] w-80 h-auto bg-card border border-border rounded-lg shadow-2xl overflow-hidden",
      "transition-all duration-300 ease-in-out transform",
      videoUrl ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
    )}>
      <div className="relative aspect-video">
        <iframe
          src={videoUrl}
          title={videoTitle || "Vídeo"}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={closeVideo}
          className="absolute top-1 right-1 bg-background/80 hover:bg-background text-foreground h-6 w-6"
          title="Fechar vídeo"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {videoTitle && (
        <div className="p-2 text-sm font-medium text-foreground truncate">
          {videoTitle}
        </div>
      )}
    </div>
  );
};