import { useState } from "react";
import { Lightbulb, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const SuggestionsFloatingButton = () => {
  const [open, setOpen] = useState(false);
  const [nomeRemetente, setNomeRemetente] = useState("");
  const [conteudoSugestao, setConteudoSugestao] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudoSugestao.trim()) {
      toast.error("A sugestão não pode estar vazia.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("sugestoes")
        .insert({
          nome_remetente: nomeRemetente.trim() || "Anônimo",
          conteudo_sugestao: conteudoSugestao.trim(),
        });

      if (error) throw error;

      toast.success("Sugestão enviada com sucesso! Agradecemos seu feedback.");
      setNomeRemetente("");
      setConteudoSugestao("");
      setOpen(false);
    } catch (error) {
      console.error("Erro ao enviar sugestão:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar sugestão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 md:left-auto md:right-6 z-50">
        <Button
          onClick={() => setOpen(true)}
          className="h-14 rounded-full shadow-2xl bg-gradient-primary flex items-center transition-all hover:scale-105
                     px-0" // Remove default horizontal padding
        >
          {/* Icon container to ensure it's a circle */}
          <div className="h-14 w-14 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <span className="hidden md:inline-block text-lg font-semibold text-white pr-6"> {/* pr-6 for right padding */}
            Sugestões
          </span>
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Enviar Sugestão</DialogTitle>
            <DialogDescription>
              Compartilhe suas ideias para melhorarmos o sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Seu Nome (Opcional)</Label>
              <Input
                id="nome"
                type="text"
                value={nomeRemetente}
                onChange={(e) => setNomeRemetente(e.target.value)}
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sugestao">Sua Sugestão de Melhoria *</Label>
              <Textarea
                id="sugestao"
                value={conteudoSugestao}
                onChange={(e) => setConteudoSugestao(e.target.value)}
                placeholder="Descreva sua sugestão aqui..."
                rows={8}
                maxLength={2000} // Limite de caracteres para a sugestão
                required
              />
              <p className="text-sm text-muted-foreground">
                Máximo de 2000 caracteres.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Sugestão
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};