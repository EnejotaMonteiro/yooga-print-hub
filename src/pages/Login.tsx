import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react"; // Importar ícone ChevronLeft para 'Voltar'
import { ThemeToggle } from "@/components/ThemeToggle";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { data: siteConfig } = useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracao_site')
        .select('logo_login_url')
        .single();

      if (error && error.code === 'PGRST116') {
        return {
          logo_login_url: '/lovable-uploads/default-login-logo.jpg',
        };
      } else if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const loginLogoSrc = siteConfig?.logo_login_url || '/lovable-uploads/default-login-logo.jpg';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error("Erro no login", {
          description: error.message,
        });
      } else {
        toast.success("Login realizado com sucesso!", {
          description: "Redirecionando para o painel..."
        });
        navigate("/");
      }
    } catch (error) {
      toast.error("Erro inesperado", {
        description: "Tente novamente em alguns instantes",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Botões de navegação e tema no canto superior esquerdo */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" // Alterado para 'sm' para acomodar texto
          onClick={() => navigate("/")} 
          title="Voltar para a Página Inicial"
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> {/* Ícone de seta para a esquerda */}
          Voltar
        </Button>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-sm bg-card/95 backdrop-blur-sm border-border/30 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <img 
            src={loginLogoSrc}
            alt="Yooga Suporte Logo" 
            className="h-14 mx-auto mb-6"
          />
          <CardTitle className="text-xl font-medium text-foreground">
            Acesso ao Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
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
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant mt-6"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;