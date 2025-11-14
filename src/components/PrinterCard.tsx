import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, Play } from "lucide-react"; // Adicionado ícone Play
import { convertToEmbedUrl } from "@/lib/utils";

interface PrinterCardProps {
  name: string;
  videoUrl: string;
  downloadUrl: string;
  networkConnection: boolean;
  recommendedWindows: string;
  id: string;
  isAdmin: boolean;
  onEdit: (printerId: string) => void;
  imageUrl?: string;

  // Novas props para drag-and-drop
  innerRef?: (element: HTMLElement | null) => void;
  draggableProps?: any;
  dragHandleProps?: any;
}

export const PrinterCard = ({
  name,
  videoUrl,
  downloadUrl,
  networkConnection,
  recommendedWindows,
  id,
  isAdmin,
  onEdit,
  imageUrl,
  innerRef,
  draggableProps,
  dragHandleProps,
}: PrinterCardProps) => {
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  const handleWatchVideo = () => {
    window.open(convertToEmbedUrl(videoUrl), '_blank');
  };

  return (
    <Card 
      className="group overflow-hidden bg-card/80 backdrop-blur-sm border-border/20 shadow-elegant hover:shadow-glow transition-smooth hover:scale-105 relative"
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(id)}
            className="bg-background/80 hover:bg-background"
            title="Editar impressora"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )}
      <CardContent className="p-0">
        <div className="aspect-video overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-t-lg" />
          ) : (
            <iframe
              src={convertToEmbedUrl(videoUrl)}
              title={`${name} - Configuração e Funcionamento`}
              className="w-full h-full rounded-t-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">{name}</h3>
          
          <div className="flex gap-2 mb-4">
            <Button
              onClick={handleWatchVideo}
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-smooth shadow-elegant"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Ver Vídeo
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Driver
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <strong>Windows recomendado:</strong> {recommendedWindows}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};