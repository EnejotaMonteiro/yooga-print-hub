import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Printer,
  BookOpen,
  Lightbulb,
  Book,
  LogIn,
  LogOut,
  Shield,
  MessageSquareText,
  Bot, // Importar o ícone Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQueryClient } from "@tanstack/react-query";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const SidebarLink = ({ to, icon, label, end }: SidebarLinkProps) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground transition-all hover:text-foreground
       group-hover:w-auto group-hover:justify-start group-hover:px-3 group-hover:py-2 group-hover:h-auto group-hover:bg-transparent group-hover:gap-2
       ${isActive ? "bg-primary/10 text-primary font-semibold" : ""}`
    }
  >
    {icon}
    <span className="opacity-0 w-0 overflow-hidden whitespace-nowrap group-hover:opacity-100 group-hover:w-auto transition-all duration-300 ease-in-out">
      {label}
    </span>
  </NavLink>
);

export const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
    }
  };

  return (
    <div className="flex flex-col h-screen w-20 group border-r bg-card/60 backdrop-blur-sm p-4 shadow-md transition-all duration-300 ease-in-out hover:w-64">
      <div className="flex items-center justify-center group-hover:justify-start h-20 mb-6 px-2">
        <img 
          src="/lovable-uploads/31bbabfd-0146-4c41-84be-fc271db11663.png" 
          alt="Yooga Suporte Logo" 
          className="h-12 w-auto opacity-0 group-hover:opacity-100 group-hover:h-16 transition-all duration-300 ease-in-out" 
        />
      </div>
      <nav className="flex-1 grid items-start gap-1">
        <SidebarLink to="/" icon={<Home className="h-4 w-4" />} label="Página Inicial" end />
        <SidebarLink to="/printers" icon={<Printer className="h-4 w-4" />} label="Impressoras" />
        <SidebarLink to="/faq" icon={<BookOpen className="h-4 w-4" />} label="Dúvidas Recorrentes" />
        <SidebarLink to="/suggestions" icon={<Lightbulb className="h-4 w-4" />} label="Sugestões" />
        <a 
          href="https://wiki-suporte-yooga.notion.site/Impressoras-Configura-es-e-poss-veis-erros-1d6468d042e84ca88165b482df10b1da#1d6468d042e84ca88165b482df10b1da" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground transition-all hover:text-foreground
                     group-hover:w-auto group-hover:justify-start group-hover:px-3 group-hover:py-2 group-hover:h-auto group-hover:bg-transparent group-hover:gap-2"
        >
          <Book className="h-4 w-4" />
          <span className="opacity-0 w-0 overflow-hidden whitespace-nowrap group-hover:opacity-100 group-hover:w-auto transition-all duration-300 ease-in-out">
            Wiki de Suporte
          </span>
        </a>
        <SidebarLink to="/chat-geral" icon={<MessageSquareText className="h-4 w-4" />} label="Chat Geral" />
        <SidebarLink to="/ai-chat" icon={<Bot className="h-4 w-4" />} label="Assistente Rogério" /> {/* Novo link */}
      </nav>
      <div className="mt-auto pt-4 border-t border-border flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  onClick={() => navigate("/admin")}
                  variant="ghost"
                  size="icon"
                  title="Painel Admin"
                >
                  <Shield className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={handleLogout} variant="ghost" size="icon" title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate("/login")} variant="ghost" size="icon" title="Login Admin">
              <LogIn className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};