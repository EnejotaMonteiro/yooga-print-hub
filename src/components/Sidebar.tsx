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
  MessageSquareText, // Manter se ainda for usado em outro lugar, senão remover
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // Importar toast diretamente do sonner
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQueryClient, useQuery } from "@tanstack/react-query"; // Importar useQuery

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  alwaysGradient?: boolean; // Nova prop para gradiente sempre ativo
}

const SidebarLink = ({ to, icon, label, end, alwaysGradient }: SidebarLinkProps) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => {
      const baseClasses = "flex items-center justify-center h-10 w-10 rounded-lg transition-all group-hover:w-auto group-hover:justify-start group-hover:px-3 group-hover:py-2 group-hover:h-auto group-hover:bg-transparent group-hover:gap-2";
      
      let currentClasses = "";
      if (alwaysGradient) {
        currentClasses = "bg-gradient-primary text-white";
      } else if (isActive) {
        currentClasses = "bg-primary/10 text-primary font-semibold";
      } else {
        currentClasses = "text-muted-foreground hover:text-foreground";
      }

      return `${baseClasses} ${currentClasses}`;
    }}
  >
    {icon}
    <span className="opacity-0 w-0 overflow-hidden whitespace-nowrap group-hover:opacity-100 group-hover:w-auto transition-all duration-300 ease-in-out">
      {label}
    </span>
  </NavLink>
);

export const Sidebar = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };
    getUser();
    const { data: { subscription } = { subscription: null } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const { data: siteConfig } = useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracao_site')
        .select('logo_full_url') // Agora buscando apenas logo_full_url para ser o logo principal
        .single();

      if (error && error.code === 'PGRST116') {
        // If no config found, return default values
        return {
          logo_full_url: '/lovable-uploads/default-full-logo.png', // Usar o mesmo default universal
        };
      } else if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const mainLogoSrc = siteConfig?.logo_full_url || '/lovable-uploads/default-full-logo.png'; // Usar logo_full_url como o logo principal

  return (
    <div className="flex flex-col h-screen w-20 group border-r bg-card/60 backdrop-blur-sm p-4 shadow-md transition-all duration-300 ease-in-out hover:w-64">
      <div className="flex items-center justify-center group-hover:justify-start h-20 mb-6 px-2 relative">
        {/* Logo para barra lateral minimizada */}
        <img 
          src={mainLogoSrc} // Usar o logo principal
          alt="Yooga Suporte Logo Minimizado" 
          className="h-12 w-auto absolute opacity-100 group-hover:opacity-0 transition-all duration-300 ease-in-out" 
        />
        {/* Logo para barra lateral expandida */}
        <img 
          src={mainLogoSrc} // Usar o logo principal
          alt="Yooga Suporte Logo Completo" 
          className="h-12 w-auto opacity-0 group-hover:opacity-100 group-hover:h-16 transition-all duration-300 ease-in-out" 
        />
      </div>
      <nav className="flex-1 grid items-start gap-1">
        <SidebarLink to="/" icon={<Home className="h-4 w-4" />} label="Página Inicial" end />
        <SidebarLink 
          to="/ai-chat" 
          icon={<Bot className="h-4 w-4" />} 
          label="Assistente Rogério" 
          alwaysGradient 
        />
        <SidebarLink to="/printers" icon={<Printer className="h-4 w-4" />} label="Impressoras" />
        <SidebarLink to="/faq" icon={<BookOpen className="h-4 w-4" />} label="Dúvidas Recorrentes" />
        <SidebarLink to="/suggestions" icon={<Lightbulb className="h-4 w-4" />} label="Sugestões" />
        {/* Revertendo para link externo */}
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
        {/* <SidebarLink to="/chat-geral" icon={<MessageSquareText className="h-4 w-4" />} label="Chat Geral" /> */} {/* Link removido */}
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