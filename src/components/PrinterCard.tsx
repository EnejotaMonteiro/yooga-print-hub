import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PrinterCardProps {
  name: string;
  videoUrl: string;
  videoUrl2: string;
  downloadUrl: string;
  networkConnection: boolean;
  recommendedWindows: string;
}

export const PrinterCard = ({ name, videoUrl, videoUrl2, downloadUrl, networkConnection, recommendedWindows }: PrinterCardProps) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const videos = [videoUrl, videoUrl2];
  
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  const nextVideo = () => {
    setCurrentVideo(1);
  };

  const prevVideo = () => {
    setCurrentVideo(0);
  };

  return (
    <Card className="group overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-elegant hover:shadow-glow transition-smooth hover:scale-105">
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden">
          {/* Vídeo atual */}
          <iframe
            src={videos[currentVideo]}
            title={`${name} - Tutorial ${currentVideo + 1}`}
            className="w-full h-full rounded-t-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          
          {/* Seta para próximo vídeo (só aparece no primeiro vídeo) */}
          {currentVideo === 0 && (
            <Button
              onClick={nextVideo}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 h-auto w-auto"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          
          {/* Seta para vídeo anterior (só aparece no segundo vídeo) */}
          {currentVideo === 1 && (
            <Button
              onClick={prevVideo}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 h-auto w-auto"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          
          {/* Indicadores */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideo(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentVideo === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">{name}</h3>
          <Button
            onClick={handleDownload}
            className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant mb-4"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Driver
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <strong>Windows recomendado:</strong> {recommendedWindows}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};