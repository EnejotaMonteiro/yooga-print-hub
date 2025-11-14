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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { convertToEmbedUrl } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

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
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        .select('id, video_guia_universal_url')
        .single();

      if (error && error.code === 'PGRST116') { // No rows found
        // Insert a default configuration if none exists
        const defaultVideoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // Placeholder
        const { data: newConfig, error: insertError } = await supabase
          .from('configuracao_site')
          .insert({ video_guia_universal_url: defaultVideoUrl })
          .select('id, video_guia_universal_url')
          .single();

        if (insertError) throw insertError;
        setConfigId(newConfig?.id || null);
        setVideoUrl(newConfig?.video_guia_universal_url || '');
        toast({
          title: "Configuração inicial criada",
          description: "Uma configuração padrão foi criada automaticamente.",
        });
      } else if (error) {
        throw error; // Other errors
      } else {
        setConfigId(data?.id || null);
        setVideoUrl(data?.video_guia_universal_url || '');
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

    // Ensure videoUrl is not empty, use a placeholder if cleared
    const finalVideoUrl = videoUrl.trim() === '' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : videoUrl;

    try {
      const { error } = await supabase
        .from('configuracao_site')
        .update({ video_guia_universal_url: finalVideoUrl })
        .eq('id', configId);

      if (error) {
        console.error('Supabase update error:', error); // Log the specific Supabase error
        throw new Error(error.message); // Throw with Supabase error message
      }

      toast({
        title: "Salvo com sucesso!",
        description: "O URL do vídeo foi atualizado"
      });
      queryClient.invalidateQueries({ queryKey: ["site-config"] }); // Invalidate the query to refetch
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as alterações", // Use specific error message
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
            Atualize o URL do vídeo do guia universal.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 py-4">
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