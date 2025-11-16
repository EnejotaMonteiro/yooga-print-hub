import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ScalePageContentEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ScalePageContentEditorDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: ScalePageContentEditorDialogProps) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data: siteConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["site-config-scales-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracao_site')
        .select('id, scales_page_content')
        .single();

      if (error && error.code === 'PGRST116') { // No rows found
        // Create a default entry if none exists
        const { data: newConfig, error: insertError } = await supabase
          .from('configuracao_site')
          .insert({}) // Insert with default values
          .select('id, scales_page_content')
          .single();

        if (insertError) throw insertError;
        return newConfig;
      } else if (error) {
        throw error;
      }
      return data;
    },
    enabled: open, // Only fetch when dialog is open
    staleTime: 0, // Always refetch when opened
  });

  useEffect(() => {
    if (siteConfig) {
      setConfigId(siteConfig.id);
      setContent(siteConfig.scales_page_content || "");
      setLoading(false);
    } else if (!isLoadingConfig && open) {
      // If no config found and not loading, means an error or initial state
      setLoading(false);
    }
  }, [siteConfig, isLoadingConfig, open]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!configId) {
      toast.error("Erro", {
        description: "ID de configuração não encontrado. Tente recarregar a página.",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('configuracao_site')
        .update({ scales_page_content: content })
        .eq('id', configId);

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(error.message);
      }

      toast.success("Conteúdo salvo com sucesso!", {
        description: "O conteúdo da página de Balanças foi atualizado."
      });
      queryClient.invalidateQueries({ queryKey: ["site-config-scales-content"] }); // Invalida o cache para a página principal
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar conteúdo da página de Balanças:', error);
      toast.error("Erro ao salvar", {
        description: error instanceof Error ? error.message : "Não foi possível salvar o conteúdo",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Conteúdo da Página de Balanças</DialogTitle>
          <DialogDescription>
            Edite o conteúdo principal da página de Balanças usando Markdown. Você pode incluir texto, listas, e imagens (colando URLs).
          </DialogDescription>
        </DialogHeader>
        {loading || isLoadingConfig ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col flex-1 space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="scalesContent">Conteúdo Markdown</Label>
                <Textarea
                  id="scalesContent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva o conteúdo da página de Balanças aqui usando Markdown..."
                  className="flex-1 font-mono text-sm"
                  rows={15}
                />
                <p className="text-xs text-muted-foreground">
                  Use Markdown para formatação. Para imagens, cole a URL diretamente: `![Alt Text](URL_DA_IMAGEM)`
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <Label>Prévia</Label>
                <div className="flex-1 border rounded-md p-4 bg-muted overflow-y-auto prose prose-sm dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || "Sua prévia aparecerá aqui..."}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-auto">
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
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Conteúdo
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};