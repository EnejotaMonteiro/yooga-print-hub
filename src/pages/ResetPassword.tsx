import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se há uma sessão de redefinição de senha ativa
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSession(session);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
      }
    });

    // Tenta obter a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Senhas não conferem", {
        description: "Por favor, digite a mesma senha em ambos os campos.",
      });
      return;
    }
    if (password.length < 6) {
      toast.error("Senha muito curta", {
        description: "A senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error("Erro ao redefinir senha", {
          description: error.message,
        });
      } else {
        toast.success("Senha redefinida com sucesso!", {
          description: "Você pode fazer login com sua nova senha.",
        });
        navigate("/login");
      }
    } catch (error) {
      toast.error("Erro inesperado", {
        description: "Tente novamente em alguns instantes",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-card/95 backdrop-blur-sm border-border/30 shadow-2xl text-center">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-foreground">
              Redefinição de Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Para redefinir sua senha, por favor, use o link enviado para seu e-mail.
            </p>
            <Button onClick={() => navigate("/login")}>
              Voltar para o Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card/95 backdrop-blur-sm border-border/30 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-medium text-foreground">
            Redefinir Senha
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir Senha"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;