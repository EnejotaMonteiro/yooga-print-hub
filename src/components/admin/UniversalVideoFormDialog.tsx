import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { convertToEmbedUrl } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query"; // Importar useQueryClient

interface UniversalVideoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const UniversalVideoFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: UniversalVideoFormDialogProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Inicializar useQueryClient

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('configuracao_site')
        .select('id, video_guia_universal_url, titulo_guia_universal, descricao_guia_universal')
        .single();

      if (error && error.code === 'PGRST116') { // No rows found
        // Insert a default configuration if none exists
        const defaultVideoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        const defaultTitle = 'Guia Universal de Configuração';
        const defaultDescription = 'Assista ao vídeo para um guia completo de configuração de impressoras.';

        const { data: newConfig, error: insertError } = await supabase
          .from('configuracao_site')
          .insert({
            video_guia_universal_url: defaultVideoUrl,
            titulo_guia_universal: defaultTitle,
            descricao_guia_universal: defaultDescription,
          })
          .select('id, video_guia_universal_url, titulo_guia_universal, descricao_guia_universal')
          .single();

        if (insertError) throw insertError;
        setConfigId(newConfig?.id || null);
        setVideoUrl(newConfig?.video_guia_universal_url || '');
        setTitle(newConfig?.titulo_guia_universal || '');
        setDescription(newConfig?.descricao_guia_universal || '');
        toast({
          title: "Configuração inicial criada",
          description: "Uma configuração padrão foi criada automaticamente.",
        });
      } else if (error) {
        throw error; // Other errors
      } else {
        setConfigId(data?.id || null);
        setVideoUrl(data?.video_guia_universal_url || '');
        setTitle(data?.titulo_guia_universal || '');
        setDescription(data?.descricao_guia_universal || '');
      }
    } catch (error) {
      console.error('Erro ao buscar/criar configuração:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!configId) {
      toast({
        title: "Erro",
        description: "ID de configuração não encontrado. Tente recarregar a página.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    const finalVideoUrl = videoUrl.trim() === '' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : videoUrl;
    const finalTitle = title.trim() === '' ? 'Guia Universal de Configuração' : title;
    const finalDescription = description.trim() === '' ? 'Assista ao vídeo para um guia completo de configuração de impressoras.' : description;

    try {
      const { error } = await supabase
        .from('configuracao_site')
        .update({
          video_guia_universal_url: finalVideoUrl,
          titulo_guia_universal: finalTitle,
          descricao_guia_universal: finalDescription,
        })
        .eq('id', configId);

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(error.message);
      }

      toast({
        title: "Salvo com sucesso!",
        description: "O URL, título e descrição do vídeo foram atualizados"
      });
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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
          <DialogTitle>Editar Guia Universal de Configuração</DialogTitle>
          <DialogDescription>
            Atualize o URL, título e descrição do vídeo do guia universal.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Guia</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Guia de Configuração Essencial"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Guia</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Assista a este vídeo para aprender a configurar suas impressoras de forma rápida e eficiente."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do Vídeo (YouTube)</Label>
              <Input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={handleVideoUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Insira o URL do YouTube (normal ou embed). Será convertido automaticamente.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};