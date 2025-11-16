import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, GripVertical, Trash2, Lock, Unlock, XCircle } from "lucide-react"; // Adicionado XCircle
import { Utility } from "@/data/utilities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useHiddenInfo } from "@/contexts/HiddenInfoContext"; // Importar o hook do contexto

interface UtilityCardProps {
  utility: Utility;
  isAdmin: boolean;
  onEdit: (utility: Utility) => void;
  onDelete: (utility: Utility) => void;
  isDragModeActive: boolean;
  innerRef?: (element: HTMLElement | null) => void;
  draggableProps?: any;
  dragHandleProps?: any;
  isDragging?: boolean;
  showHiddenInfo: boolean; // Nova prop para controlar a visibilidade global
}

export const UtilityCard = ({
  utility,
  isAdmin,
  onEdit,
  onDelete,
  isDragModeActive,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging,
  showHiddenInfo, // Recebe o estado global
}: UtilityCardProps) => {
  const { hideHiddenInfo } = useHiddenInfo(); // Usar a função do contexto

  const handleDownload = () => {
    window.open(utility.download_url, '_blank');
  };

  return (
    <>
      <Card
        className={`group overflow-hidden bg-card/80 backdrop-blur-sm border-border/20 shadow-elegant relative transition-smooth
          ${isDragging ? "border-primary shadow-glow" : "hover:scale-105"}
        `}
        ref={innerRef}
        {...draggableProps}
        {...(isDragModeActive ? dragHandleProps : {})}
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
              onClick={() => onEdit(utility)}
              className="bg-background/80 hover:bg-background"
              title="Editar utilitário"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(utility)}
              className="bg-background/80 hover:bg-background text-destructive"
              title="Excluir utilitário"
            >
              <Trash2 className="w-4 h-4" />
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
          {utility.hidden_info && showHiddenInfo && ( // Exibir se houver info e o modo global estiver ativo
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="font-semibold text-lg mb-2 flex items-center justify-between"> {/* Adicionado justify-between */}
                <span className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-primary" />
                  Informação Oculta
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={hideHiddenInfo} // Botão para fechar
                  title="Ocultar informação"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </h4>
              <div className="bg-muted p-3 rounded-md max-h-60 overflow-y-auto prose prose-sm dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {utility.hidden_info}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};