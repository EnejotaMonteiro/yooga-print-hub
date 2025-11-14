import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { convertToEmbedUrl } from "@/lib/utils"; // Importar a função de utilidade

interface TutorialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorial?: {
    id: string;
    titulo: string;
    descricao: string;
    video_url: string;
    ordem: number;
  } | null;
  onSuccess: () => void;
}

export const TutorialFormDialog = ({ open, onOpenChange, tutorial, onSuccess }: TutorialFormDialogProps) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [ordem, setOrdem] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tutorial) {
      setTitulo(tutorial.titulo);
      setDescricao(tutorial.descricao);
      setVideoUrl(tutorial.video_url);
      setOrdem(tutorial.ordem);
    } else {
      setTitulo("");
      setDescricao("");
      setVideoUrl("");
      setOrdem(0);
    }
  }, [tutorial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tutorialData = {
        titulo,
        descricao,
        video_url: videoUrl,
        ordem
      };

      if (tutorial) {
        // Atualizar
        const { error } = await supabase
          .from("tutoriais")
          .update(tutorialData)
          .eq("id", tutorial.id);

        if (error) throw error;
        toast.success("Tutorial atualizado com sucesso!");
      } else {
        // Criar novo
        const { error } = await supabase
          .from("tutoriais")
          .insert([tutorialData]);

        if (error) throw error;
        toast.success("Tutorial criado com sucesso!");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar tutorial:", error);
      toast.error("Erro ao salvar tutorial");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawUrl = e.target.value;
    setVideoUrl(convertToEmbedUrl(rawUrl));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tutorial ? "Editar Tutorial" : "Novo Tutorial"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Como reiniciar o spooler"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o conteúdo do tutorial..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL do Vídeo (YouTube Embed)</Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={handleVideoUrlChange} // Usar o novo handler
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <p className="text-xs text-muted-foreground">
              Use o formato embed: https://www.youtube.com/embed/VIDEO_ID
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ordem">Ordem de Exibição</Label>
            <Input
              id="ordem"
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(parseInt(e.target.value))}
              min={0}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {tutorial ? "Salvar Alterações" : "Criar Tutorial"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};