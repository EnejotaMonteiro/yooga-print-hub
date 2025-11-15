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
import { toast } from "sonner";
import { Loader2, UploadCloud, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface LogoSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const LogoSettingsDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: LogoSettingsDialogProps) => {
  const [mainLogoFile, setMainLogoFile] = useState<File | null>(null);
  const [currentMainLogoUrl, setCurrentMainLogoUrl] = useState<string | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        .select('id, logo_full_url') // Usaremos logo_full_url como o logo principal
        .single();

      if (error && error.code === 'PGRST116') { // No rows found
        const defaultLogoUrl = '/lovable-uploads/default-full-logo.png';

        const { data: newConfig, error: insertError } = await supabase
          .from('configuracao_site')
          .insert({
            logo_min_url: defaultLogoUrl,
            logo_full_url: defaultLogoUrl,
            logo_login_url: defaultLogoUrl,
          })
          .select('id, logo_full_url')
          .single();

        if (insertError) throw insertError;
        setConfigId(newConfig?.id || null);
        setCurrentMainLogoUrl(newConfig?.logo_full_url || null);
        toast.info("Configuração inicial criada", {
          description: "Uma configuração padrão de logo foi criada automaticamente.",
        });
      } else if (error) {
        throw error;
      } else {
        setConfigId(data?.id || null);
        setCurrentMainLogoUrl(data?.logo_full_url || null);
      }
    } catch (error) {
      console.error('Erro ao buscar/criar configuração de logos:', error);
      toast.error("Erro ao carregar", {
        description: "Não foi possível carregar as configurações de logos",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from('logos')
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!configId) {
      toast.error("Erro", {
        description: "ID de configuração não encontrado. Tente recarregar a página.",
      });
      return;
    }

    setSaving(true);
    let newMainLogoUrlToSave: string | null = currentMainLogoUrl;

    try {
      if (mainLogoFile) {
        newMainLogoUrlToSave = await uploadFile(mainLogoFile, `main-logo-${Date.now()}.${mainLogoFile.name.split('.').pop()}`);
      } else if (currentMainLogoUrl === null) { // Se o usuário clicou em remover
        newMainLogoUrlToSave = null;
      }

      const { error } = await supabase
        .from('configuracao_site')
        .update({
          logo_min_url: newMainLogoUrlToSave,
          logo_full_url: newMainLogoUrlToSave,
          logo_login_url: newMainLogoUrlToSave,
        })
        .eq('id', configId);

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(error.message);
      }

      toast.success("Salvo com sucesso!", {
        description: "O logo principal foi atualizado em todas as instâncias."
      });
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar logos:', error);
      toast.error("Erro ao salvar", {
        description: error instanceof Error ? error.message : "Não foi possível salvar o logo",
      });
    } finally {
      setSaving(false);
      setMainLogoFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurações de Logo</DialogTitle>
          <DialogDescription>
            Atualize a imagem do logo principal que será usada em toda a aplicação.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 py-4">
            {/* Logo Principal */}
            <div className="space-y-2">
              <Label htmlFor="mainLogo">Logo Principal</Label>
              <Input
                id="mainLogo"
                type="file"
                accept="image/*"
                onChange={(e) => setMainLogoFile(e.target.files ? e.target.files[0] : null)}
              />
              {currentMainLogoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Logo atual:</p>
                  <img src={currentMainLogoUrl} alt="Logo Principal Atual" className="h-10 w-auto object-contain" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMainLogoUrl(null)} // Define como null para remover
                    title="Remover imagem atual"
                  >
                    <XCircle className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              )}
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
                  <>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Salvar Logo
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