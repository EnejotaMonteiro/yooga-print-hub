import React from 'react';

interface VideoTutorialProps {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

export const VideoTutorial = ({ id, title, description, videoUrl }: VideoTutorialProps) => {
  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg shadow-elegant overflow-hidden transition-smooth hover:shadow-glow">
      <div className="p-4">
        {/* Mini Player de Vídeo */}
        <div className="aspect-video mb-4 rounded overflow-hidden">
          <iframe
            src={videoUrl}
            title={title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        {/* Título do Tópico */}
        <h4 className="text-lg font-semibold mb-3 text-foreground">
          {title}
        </h4>
        
        {/* Descrição em Texto */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};