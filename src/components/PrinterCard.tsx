import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, ArrowUp, ArrowDown } from "lucide-react"; // Import Edit, ArrowUp, ArrowDown
import { convertToEmbedUrl } from "@/lib/utils"; // Importar a função de utilidade

interface PrinterCardProps {
  name: string;
  videoUrl: string;
  downloadUrl: string;
  networkConnection: boolean;
  recommendedWindows: string;
  id: string; // Add id for editing/reordering
  isAdmin: boolean; // New prop
  onEdit: (printerId: string) => void; // New prop
  onMove: (printerId: string, direction: 'up' | 'down') => void; // New prop
  isFirst: boolean; // New prop to disable 'up' for first item
  isLast: boolean; // New prop to disable 'down' for last item
}

export const PrinterCard = ({
  name,
  videoUrl,
  downloadUrl,
  networkConnection,
  recommendedWindows,
  id, // Destructure id
  isAdmin,
  onEdit,
  onMove,
  isFirst,
  isLast,
}: PrinterCardProps) => {
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <Card className="group overflow-hidden bg-card/80 backdrop-blur-sm border-border/20 shadow-elegant hover:shadow-glow transition-smooth hover:scale-105 relative"> {/* Add relative for absolute positioning of admin controls */}
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(id, 'up')}
            disabled={isFirst}
            className="bg-background/80 hover:bg-background"
            title="Mover para cima"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(id, 'down')}
            disabled={isLast}
            className="bg-background/80 hover:bg-background"
            title="Mover para baixo"
          </Button>
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
          <iframe
            src={convertToEmbedUrl(videoUrl)}
            title={`${name} - Configuração e Funcionamento`}
            className="w-full h-full rounded-t-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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