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
import { Loader2, UploadCloud, XCircle } from "lucide-react"; // Adicionado XCircle para o botão de remover
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
  const [minLogoFile, setMinLogoFile] = useState<File | null>(null);
  const [fullLogoFile, setFullLogoFile] = useState<File | null>(null);
  const [loginLogoFile, setLoginLogoFile] = useState<File | null>(null);
  const [currentMinLogoUrl, setCurrentMinLogoUrl] = useState<string | null>(null); // Pode ser null
  const [currentFullLogoUrl, setCurrentFullLogoUrl] = useState<string | null>(null); // Pode ser null
  const [currentLoginLogoUrl, setCurrentLoginLogoUrl] = useState<string | null>(null); // Pode ser null
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
        .select('id, logo_min_url, logo_full_url, logo_login_url')
        .single();

      if (error && error.code === 'PGRST116') { // No rows found
        // Insert a default configuration if none exists
        const { data: newConfig, error: insertError } = await supabase
          .from('configuracao_site')
          .insert({
            logo_min_url: '/lovable-uploads/default-min-logo.jpg',
            logo_full_url: '/lovable-uploads/default-full-logo.png',
            logo_login_url: '/lovable-uploads/default-login-logo.jpg',
          })
          .select('id, logo_min_url, logo_full_url, logo_login_url')
          .single();

        if (insertError) throw insertError;
        setConfigId(newConfig?.id || null);
        setCurrentMinLogoUrl(newConfig?.logo_min_url || null);
        setCurrentFullLogoUrl(newConfig?.logo_full_url || null);
        setCurrentLoginLogoUrl(newConfig?.logo_login_url || null);
        toast.info("Configuração inicial criada", {
          description: "Uma configuração padrão de logos foi criada automaticamente.",
        });
      } else if (error) {
        throw error; // Other errors
      } else {
        setConfigId(data?.id || null);
        setCurrentMinLogoUrl(data?.logo_min_url || null);
        setCurrentFullLogoUrl(data?.logo_full_url || null);
        setCurrentLoginLogoUrl(data?.logo_login_url || null);
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
    let newMinLogoUrlToSave: string | null = currentMinLogoUrl;
    let newFullLogoUrlToSave: string | null = currentFullLogoUrl;
    let newLoginLogoUrlToSave: string | null = currentLoginLogoUrl;

    try {
      if (minLogoFile) {
        newMinLogoUrlToSave = await uploadFile(minLogoFile, `min-logo-${Date.now()}.${minLogoFile.name.split('.').pop()}`);
      } else if (currentMinLogoUrl === null) { // Se o usuário clicou em remover
        newMinLogoUrlToSave = null;
      }

      if (fullLogoFile) {
        newFullLogoUrlToSave = await uploadFile(fullLogoFile, `full-logo-${Date.now()}.${fullLogoFile.name.split('.').pop()}`);
      } else if (currentFullLogoUrl === null) { // Se o usuário clicou em remover
        newFullLogoUrlToSave = null;
      }

      if (loginLogoFile) {
        newLoginLogoUrlToSave = await uploadFile(loginLogoFile, `login-logo-${Date.now()}.${loginLogoFile.name.split('.').pop()}`);
      } else if (currentLoginLogoUrl === null) { // Se o usuário clicou em remover
        newLoginLogoUrlToSave = null;
      }

      const { error } = await supabase
        .from('configuracao_site')
        .update({
          logo_min_url: newMinLogoUrlToSave,
          logo_full_url: newFullLogoUrlToSave,
          logo_login_url: newLoginLogoUrlToSave,
        })
        .eq('id', configId);

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(error.message);
      }

      toast.success("Salvo com sucesso!", {
        description: "Os logos foram atualizados."
      });
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar logos:', error);
      toast.error("Erro ao salvar", {
        description: error instanceof Error ? error.message : "Não foi possível salvar os logos",
      });
    } finally {
      setSaving(false);
      setMinLogoFile(null);
      setFullLogoFile(null);
      setLoginLogoFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurações de Logos</DialogTitle>
          <DialogDescription>
            Atualize as imagens dos logos para a barra lateral e página de login.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 py-4">
            {/* Logo Minimizado */}
            <div className="space-y-2">
              <Label htmlFor="minLogo">Logo Minimizado (Barra Lateral)</Label>
              <Input
                id="minLogo"
                type="file"
                accept="image/*"
                onChange={(e) => setMinLogoFile(e.target.files ? e.target.files[0] : null)}
              />
              {currentMinLogoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Logo atual:</p>
                  <img src={currentMinLogoUrl} alt="Logo Minimizado Atual" className="h-10 w-auto object-contain" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMinLogoUrl(null)} // Define como null para remover
                    title="Remover imagem atual"
                  >
                    <XCircle className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>

            {/* Logo Completo */}
            <div className="space-y-2">
              <Label htmlFor="fullLogo">Logo Completo (Barra Lateral Expandida)</Label>
              <Input
                id="fullLogo"
                type="file"
                accept="image/*"
                onChange={(e) => setFullLogoFile(e.target.files ? e.target.files[0] : null)}
              />
              {currentFullLogoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Logo atual:</p>
                  <img src={currentFullLogoUrl} alt="Logo Completo Atual" className="h-10 w-auto object-contain" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentFullLogoUrl(null)} // Define como null para remover
                    title="Remover imagem atual"
                  >
                    <XCircle className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>

            {/* Logo Página de Login */}
            <div className="space-y-2">
              <Label htmlFor="loginLogo">Logo Página de Login</Label>
              <Input
                id="loginLogo"
                type="file"
                accept="image/*"
                onChange={(e) => setLoginLogoFile(e.target.files ? e.target.files[0] : null)}
              />
              {currentLoginLogoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Logo atual:</p>
                  <img src={currentLoginLogoUrl} alt="Logo Login Atual" className="h-10 w-auto object-contain" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentLoginLogoUrl(null)} // Define como null para remover
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
                    Salvar Logos
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