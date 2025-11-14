import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { convertToEmbedUrl } from "@/lib/utils"; // Importar a função de utilidade

export const SiteConfigForm = () => {
  const [videoUrl, setVideoUrl] = useState(""); // Manter o estado para evitar erros, mas não será usado na UI
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

    // Manter o valor atual do banco de dados para video_guia_universal_url, já que o campo foi removido da UI
    // Ou, se preferir, pode definir um valor padrão ou nulo. Por enquanto, manteremos o que já está no banco.
    // Para simplificar, não faremos nenhuma atualização neste campo se ele não estiver na UI.
    // Se houver necessidade de atualizar este campo no futuro, ele precisará ser reintroduzido na UI ou gerenciado de outra forma.

    try {
      // Não há campo para atualizar, então a requisição de update não precisa ser feita para este campo.
      // Se houver outros campos no futuro, eles seriam atualizados aqui.
      // Por enquanto, a função de salvar não fará nada se não houver outros campos.
      // Para evitar um erro de "nenhuma linha afetada" ou similar, podemos simplesmente não chamar o update
      // se não houver campos para atualizar.
      toast({
        title: "Salvo com sucesso!",
        description: "Não há configurações específicas para salvar no momento."
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

  // O handler de mudança de URL não é mais necessário, pois o campo foi removido.
  // const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const rawUrl = e.target.value;
  //   setVideoUrl(convertToEmbedUrl(rawUrl));
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* O bloco de URL do vídeo foi removido daqui */}

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