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
import { Loader2, UploadCloud } from "lucide-react";
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
  const [currentMinLogoUrl, setCurrentMinLogoUrl] = useState<string>('');
  const [currentFullLogoUrl, setCurrentFullLogoUrl] = useState<string>('');
  const [currentLoginLogoUrl, setCurrentLoginLogoUrl] = useState<string>('');
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
        .select('id, logo_min_url, logo_full_url, logo_login_url')
        .single();

      if (error && error.code === 'PGRST116') { // No rows found
        // Insert a default configuration if none exists
        const { data: newConfig, error: insertError } = await supabase
          .from('configuracao_site')
          .insert({
            logo_min_url: '/lovable-uploads/logo-min.jpg',
            logo_full_url: '/lovable-uploads/logo-full.jpg',
            logo_login_url: '/lovable-uploads/31bbabfd-0146-4c41-84be-fc271db11663.png',
          })
          .select('id, logo_min_url, logo_full_url, logo_login_url')
          .single();

        if (insertError) throw insertError;
        setConfigId(newConfig?.id || null);
        setCurrentMinLogoUrl(newConfig?.logo_min_url || '');
        setCurrentFullLogoUrl(newConfig?.logo_full_url || '');
        setCurrentLoginLogoUrl(newConfig?.logo_login_url || '');
        toast({
          title: "Configuração inicial criada",
          description: "Uma configuração padrão de logos foi criada automaticamente.",
        });
      } else if (error) {
        throw error; // Other errors
      } else {
        setConfigId(data?.id || null);
        setCurrentMinLogoUrl(data?.logo_min_url || '');
        setCurrentFullLogoUrl(data?.logo_full_url || '');
        setCurrentLoginLogoUrl(data?.logo_login_url || '');
      }
    } catch (error) {
      console.error('Erro ao buscar/criar configuração de logos:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as configurações de logos",
        variant: "destructive"
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
      toast({
        title: "Erro",
        description: "ID de configuração não encontrado. Tente recarregar a página.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    let newMinLogoUrl = currentMinLogoUrl;
    let newFullLogoUrl = currentFullLogoUrl;
    let newLoginLogoUrl = currentLoginLogoUrl;

    try {
      if (minLogoFile) {
        newMinLogoUrl = await uploadFile(minLogoFile, `min-logo-${Date.now()}.${minLogoFile.name.split('.').pop()}`);
      }
      if (fullLogoFile) {
        newFullLogoUrl = await uploadFile(fullLogoFile, `full-logo-${Date.now()}.${fullLogoFile.name.split('.').pop()}`);
      }
      if (loginLogoFile) {
        newLoginLogoUrl = await uploadFile(loginLogoFile, `login-logo-${Date.now()}.${loginLogoFile.name.split('.').pop()}`);
      }

      const { error } = await supabase
        .from('configuracao_site')
        .update({
          logo_min_url: newMinLogoUrl,
          logo_full_url: newFullLogoUrl,
          logo_login_url: newLoginLogoUrl,
        })
        .eq('id', configId);

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(error.message);
      }

      toast({
        title: "Salvo com sucesso!",
        description: "Os logos foram atualizados."
      });
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar logos:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar os logos",
        variant: "destructive"
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
            <div className="space-y-2">
              <Label htmlFor="minLogo">Logo Minimizado (Barra Lateral)</Label>
              <Input
                id="minLogo"
                type="file"
                accept="image/*"
                onChange={(e) => setMinLogoFile(e.target.files ? e.target.files[0] : null)}
              />
              {currentMinLogoUrl && !minLogoFile && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Logo atual:</p>
                  <img src={currentMinLogoUrl} alt="Logo Minimizado Atual" className="h-10 w-auto object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullLogo">Logo Completo (Barra Lateral Expandida)</Label>
              <Input
                id="fullLogo"
                type="file"
                accept="image/*"
                onChange={(e) => setFullLogoFile(e.target.files ? e.target.files[0] : null)}
              />
              {currentFullLogoUrl && !fullLogoFile && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Logo atual:</p>
                  <img src={currentFullLogoUrl} alt="Logo Completo Atual" className="h-10 w-auto object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginLogo">Logo Página de Login</Label>
              <Input
                id="loginLogo"
                type="file"
                accept="image/*"
                onChange={(e) => setLoginLogoFile(e.target.files ? e.target.files[0] : null)}
              />
              {currentLoginLogoUrl && !loginLogoFile && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Logo atual:</p>
                  <img src={currentLoginLogoUrl} alt="Logo Login Atual" className="h-10 w-auto object-contain" />
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