import { useState } from "react";
import { Lightbulb, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const suggestionSchema = z.object({
  nome_remetente: z.string().trim().max(100, "Nome deve ter no máximo 100 caracteres"),
  conteudo_sugestao: z.string().trim().min(1, "A sugestão não pode estar vazia").max(2000, "Sugestão deve ter no máximo 2000 caracteres"),
});

const SuggestionsPage = () => {
  const [nomeRemetente, setNomeRemetente] = useState("");
  const [conteudoSugestao, setConteudoSugestao] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      // Validate input using zod schema
      const validatedData = suggestionSchema.parse({
        nome_remetente: nomeRemetente.trim() || "Anônimo",
        conteudo_sugestao: conteudoSugestao.trim(),
      });

      const { error } = await supabase
        .from("sugestoes")
        .insert({
          nome_remetente: validatedData.nome_remetente,
          conteudo_sugestao: validatedData.conteudo_sugestao,
        });

      if (error) throw error;

      toast.success("Sugestão enviada com sucesso! Agradecemos seu feedback.");
      setNomeRemetente("");
      setConteudoSugestao("");
    } catch (error) {
      console.error("Erro ao enviar sugestão:", error);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error instanceof Error ? error.message : "Erro ao enviar sugestão.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Lightbulb className="h-7 w-7 text-primary" />
        Enviar Sugestão
      </h1>

      <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-border shadow-elegant">
        <CardHeader>
          <CardTitle>Compartilhe suas ideias</CardTitle>
          <CardDescription>
            Ajude-nos a melhorar a plataforma enviando suas sugestões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                maxLength={2000}
                required
              />
              <p className="text-sm text-muted-foreground">
                Máximo de 2000 caracteres.
              </p>
            </div>
            <div className="flex justify-end">
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionsPage;