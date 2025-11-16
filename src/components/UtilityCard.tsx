import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, GripVertical, Trash2, Lock, Unlock } from "lucide-react";
import { Utility } from "@/data/utilities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
}: UtilityCardProps) => {
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [showHiddenInfo, setShowHiddenInfo] = useState(false);

  const CORRECT_PASSWORD = "tcmcbxkbrdsc";

  const handleDownload = () => {
    window.open(utility.download_url, '_blank');
  };

  const handleCardClick = () => {
    if (utility.hidden_info) {
      setClickCount(prev => prev + 1);

      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 300); // Reset count if no triple click within 300ms
    }
  };

  // Open dialog when triple-clicked
  if (clickCount === 3 && !isPasswordDialogOpen && utility.hidden_info) {
    setClickCount(0); // Reset count immediately
    setIsPasswordDialogOpen(true);
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === CORRECT_PASSWORD) {
      setShowHiddenInfo(true);
      setIsPasswordDialogOpen(false);
      setEnteredPassword("");
      toast.success("Acesso concedido!", {
        description: "A informação oculta foi revelada.",
      });
    } else {
      toast.error("Senha incorreta", {
        description: "Por favor, tente novamente.",
      });
      setEnteredPassword("");
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) {
      setEnteredPassword("");
      setShowHiddenInfo(false); // Reset hidden info visibility when dialog closes
    }
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
        onClick={handleCardClick} // Adiciona o handler de clique ao Card
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
          {utility.hidden_info && (
            <div className="mt-4 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Triplo clique para informação oculta</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Senha */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Acesso Restrito</DialogTitle>
            <DialogDescription>
              Esta informação é protegida por senha. Por favor, insira a senha para continuar.
            </DialogDescription>
          </DialogHeader>
          {!showHiddenInfo ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Unlock className="w-4 h-4 mr-2" />
                  Acessar
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4 py-4">
              <h4 className="font-semibold text-lg">Informação Oculta:</h4>
              <div className="bg-muted p-4 rounded-md max-h-60 overflow-y-auto prose prose-sm dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {utility.hidden_info || "Nenhuma informação oculta disponível."}
                </ReactMarkdown>
              </div>
              <DialogFooter>
                <Button type="button" onClick={() => handleDialogClose(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};