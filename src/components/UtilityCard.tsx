import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, GripVertical } from "lucide-react";
import { Utility } from "@/data/utilities"; // Importar a interface Utility

interface UtilityCardProps {
  utility: Utility;
  isAdmin: boolean;
  onEdit: (utility: Utility) => void;
  isDragModeActive: boolean;
  innerRef?: (element: HTMLElement | null) => void;
  draggableProps?: any;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export const UtilityCard = ({
  utility,
  isAdmin,
  onEdit,
  isDragModeActive,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging,
}: UtilityCardProps) => {
  const handleDownload = () => {
    window.open(utility.download_url, '_blank');
  };

  return (
    <Card
      className={`group overflow-hidden bg-card/80 backdrop-blur-sm border-border/20 shadow-elegant relative transition-smooth
        ${isDragging ? "border-primary shadow-glow" : "hover:scale-105"}
      `}
      ref={innerRef}
      {...draggableProps}
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          {isDragModeActive && (
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 hover:bg-background cursor-grab"
              title="Arrastar para reordenar"
              {...dragHandleProps}
            >
              <GripVertical className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(utility)}
            className="bg-background/80 hover:bg-background"
            title="Editar utilitário"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )}
      {utility.image_url && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img src={utility.image_url} alt={utility.name} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className={utility.image_url ? "pt-4" : ""}>
        <CardTitle>{utility.name}</CardTitle>
        <CardDescription>{utility.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <a href={utility.download_url} target="_blank" rel="noopener noreferrer">
          <Button className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </a>
      </CardContent>
    </Card>
  );
};