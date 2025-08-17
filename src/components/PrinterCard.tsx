import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useState } from "react";

interface PrinterCardProps {
  name: string;
  videoUrl: string;
  downloadUrl: string;
  networkConnection: boolean;
  recommendedWindows: string;
}

export const PrinterCard = ({ name, videoUrl, downloadUrl, networkConnection, recommendedWindows }: PrinterCardProps) => {
  const [additionalVideos, setAdditionalVideos] = useState<string[]>([]);
  
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  const addAdditionalVideo = () => {
    // Por enquanto, vamos adicionar o mesmo vídeo como exemplo
    // Depois pode ser implementado um modal para adicionar URL personalizada
    setAdditionalVideos([...additionalVideos, videoUrl]);
  };

  return (
    <Card className="group overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-elegant hover:shadow-glow transition-smooth hover:scale-105">
      <CardContent className="p-0">
        <div className="space-y-4">
          {/* Vídeo principal */}
          <div className="relative aspect-video overflow-hidden">
            <iframe
              src={videoUrl}
              title={`${name} - Configuração e Funcionamento`}
              className="w-full h-full rounded-t-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <Button
              onClick={addAdditionalVideo}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 h-auto w-auto"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Vídeos adicionais */}
          {additionalVideos.map((video, index) => (
            <div key={index} className="aspect-video overflow-hidden">
              <iframe
                src={video}
                title={`${name} - Configuração Adicional ${index + 1}`}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
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