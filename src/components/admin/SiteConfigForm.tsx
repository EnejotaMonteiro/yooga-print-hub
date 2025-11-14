import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { convertToEmbedUrl } from "@/lib/utils"; // Importar a função de utilidade

export const SiteConfigForm = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracao_site')
        .select('id, video_guia_universal_url')
        .single();

      if (error) throw error;
      setConfigId(data?.id || null);
      setVideoUrl(data?.video_guia_universal_url || '');
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
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
        description: "ID de configuração não encontrado",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('configuracao_site')
        .update({ video_guia_universal_url: videoUrl })
        .eq('id', configId);

      if (error) throw error;

      toast({
        title: "Salvo com sucesso!",
        description: "O URL do vídeo foi atualizado"
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="videoUrl" className="text-sm font-medium">
          URL do Vídeo - Guia Universal de Configuração
        </Label>
        <Input
          id="videoUrl"
          type="url"
          value={videoUrl}
          onChange={handleVideoUrlChange} // Usar o novo handler
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full"
          required
        />
        <p className="text-xs text-muted-foreground">
          Insira o URL do YouTube (normal ou embed). Será convertido automaticamente.
        </p>
      </div>

      {videoUrl && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <iframe
              src={videoUrl}
              title="Preview do Guia Universal"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={saving}
        className="w-full sm:w-auto"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          "Salvar Alterações"
        )}
      </Button>
    </form>
  );
};