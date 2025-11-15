import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, GripVertical } from "lucide-react";
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

  innerRef?: (element: HTMLElement | null) => void;
  draggableProps?: any;
  dragHandleProps?: any;
  isDragModeActive: boolean; // Adicionado para controlar a ativação do dragHandleProps
  isDragging?: boolean; // Adicionado para estilo visual durante o arrasto
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
  isDragModeActive,
  isDragging,
}: PrinterCardProps) => {
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <Card 
      className={`group overflow-hidden bg-card/80 backdrop-blur-sm border-border/20 shadow-elegant relative transition-smooth
        ${isDragging ? "border-primary shadow-glow" : "hover:scale-105"}
      `}
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps} {/* Espalha dragHandleProps diretamente */}
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          {isDragModeActive && (
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 hover:bg-background cursor-grab"
              title="Arrastar para reordenar"
            >
              <GripVertical className="w-4 h-4" />
            </Button>
          )}
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
        <div className="aspect-video overflow-hidden printer-media-wrapper">
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