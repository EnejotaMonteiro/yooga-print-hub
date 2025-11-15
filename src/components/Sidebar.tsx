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
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQueryClient, useQuery } from "@tanstack/react-query";

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
      `flex items-center rounded-lg transition-all duration-500 ease-in-out
       ${isActive 
         ? "bg-primary/10 text-primary font-semibold" 
         : "text-muted-foreground hover:text-foreground group-hover:bg-transparent group-hover:text-foreground"}`
    }
  >
    <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
      {icon}
    </div>
    <span className="opacity-0 max-w-0 overflow-hidden whitespace-nowrap 
                 transition-opacity duration-75 ease-out 
                 transition-[max-width,margin-left] duration-500 ease-in-out 
                 group-hover:opacity-100 group-hover:max-w-full group-hover:ml-2
                 group-hover:duration-500">
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
        .select('logo_full_url')
        .single();

      if (error && error.code === 'PGRST116') {
        return {
          logo_full_url: '/lovable-uploads/default-full-logo.png',
        };
      } else if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado", {
        description: "Você foi desconectado com sucesso"
      });
      navigate("/login");
    } catch (error) {
      toast.error("Erro no logout", {
        description: "Tente novamente",
      });
    } finally {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
    }
  };

  const mainLogoSrc = siteConfig?.logo_full_url || '/lovable-uploads/default-full-logo.png';

  return (
    <div className="fixed left-0 top-0 z-50 flex flex-col h-screen w-20 group bg-card shadow-md transition-all duration-500 ease-in-out hover:w-64">
      <div className="flex items-center justify-center group-hover:justify-start h-20 mb-6 py-4 px-4 relative">
        {/* Ícone para barra lateral minimizada */}
        <Printer className="h-8 w-8 text-primary absolute opacity-100 group-hover:opacity-0 transition-all duration-500 ease-in-out" />
        {/* Logo para barra lateral expandida */}
        <img 
          src={mainLogoSrc} 
          alt="Yooga Suporte Logo Completo" 
          className="h-12 w-auto opacity-0 group-hover:opacity-100 group-hover:h-16 transition-all duration-500 ease-in-out" 
        />
      </div>
      <nav className="flex-1 grid items-start gap-1 px-4">
        {/* Link customizado para Assistente Rogério com gradiente permanente */}
        <NavLink
          to="/ai-chat"
          className={({ isActive }) =>
            `flex items-center rounded-lg transition-all duration-500 ease-in-out
             bg-gradient-primary text-white
             ${isActive ? "font-semibold" : ""}
             group-hover:bg-gradient-primary group-hover:text-white`
          }
        >
          <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <span className="opacity-0 max-w-0 overflow-hidden whitespace-nowrap 
                 transition-opacity duration-75 ease-out 
                 transition-[max-width,margin-left] duration-500 ease-in-out 
                 group-hover:opacity-100 group-hover:max-w-full group-hover:ml-2
                 group-hover:duration-500">
            Assistente Rogério
          </span>
        </NavLink>

        <SidebarLink to="/" icon={<Home className="h-4 w-4" />} label="Página Inicial" end />
        <SidebarLink to="/printers" icon={<Printer className="h-4 w-4" />} label="Impressoras" />
        <SidebarLink to="/faq" icon={<BookOpen className="h-4 w-4" />} label="Dúvidas Recorrentes" />
        <SidebarLink to="/suggestions" icon={<Lightbulb className="h-4 w-4" />} label="Sugestões" />
        <a 
          href="https://wiki-suporte-yooga.notion.site/Impressoras-Configura-es-e-poss-veis-erros-1d6468d042e84ca88165b482df10b1da#1d6468d042e84ca88165b482df10b1da" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center rounded-lg text-muted-foreground transition-all hover:text-foreground
                     group-hover:bg-transparent group-hover:text-foreground"
        >
          <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
            <Book className="h-4 w-4" />
          </div>
          <span className="opacity-0 max-w-0 overflow-hidden whitespace-nowrap 
                 transition-opacity duration-75 ease-out 
                 transition-[max-width,margin-left] duration-500 ease-in-out 
                 group-hover:opacity-100 group-hover:max-w-full group-hover:ml-2
                 group-hover:duration-500">
            Wiki de Suporte
          </span>
        </a>
      </nav>
      <div className="mt-auto py-4 bg-gradient-primary text-white flex flex-col gap-2">
        <div className="flex items-center justify-center group-hover:justify-end group-hover:gap-2 px-4">
          <ThemeToggle />
          {user ? (
            <>
              {isAdmin && (
                <Button
                  onClick={() => navigate("/admin")}
                  variant="ghost"
                  size="icon"
                  title="Painel Admin"
                  className="opacity-0 max-w-0 overflow-hidden 
                             transition-opacity duration-75 ease-out 
                             transition-[max-width] duration-500 ease-in-out 
                             group-hover:opacity-100 group-hover:max-w-full 
                             group-hover:duration-500
                             text-white hover:bg-white/20"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={handleLogout} variant="ghost" size="icon" title="Sair" 
                      className="opacity-0 max-w-0 overflow-hidden 
                                 transition-opacity duration-75 ease-out 
                                 transition-[max-width] duration-500 ease-in-out 
                                 group-hover:opacity-100 group-hover:max-w-full 
                                 group-hover:duration-500
                                 text-white hover:bg-white/20">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate("/login")} variant="ghost" size="icon" title="Login Admin" 
                    className="opacity-0 max-w-0 overflow-hidden 
                               transition-opacity duration-75 ease-out 
                               transition-[max-width] duration-500 ease-in-out 
                               group-hover:opacity-100 group-hover:max-w-full 
                               group-hover:duration-500
                               text-white hover:bg-white/20">
              <LogIn className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};