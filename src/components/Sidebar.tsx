import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  Wrench,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils"; // Importar cn para classes condicionais

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  isSidebarExpanded: boolean; // Adicionar esta prop
}

const SidebarLink = ({ to, icon, label, end, isSidebarExpanded }: SidebarLinkProps) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        "flex items-center rounded-lg transition-all duration-500 ease-in-out",
        isSidebarExpanded ? "w-full" : "w-10 group-hover:w-full", // Aplica a largura base e a transição de hover para todos os links
        isActive 
          ? "bg-primary/10 text-primary font-semibold" // Estilo para link ativo
          : "text-muted-foreground hover:text-foreground group-hover:bg-transparent group-hover:text-foreground" // Estilo para link inativo
      )
    }
  >
    <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
      {icon}
    </div>
    <span
      className={cn(
        "overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out",
        isSidebarExpanded
          ? "opacity-100 max-w-full ml-2"
          : "opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-full group-hover:ml-2"
      )}
    >
      {label}
    </span>
  </NavLink>
);

export const Sidebar = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const location = useLocation(); // Inicializar useLocation
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Novo estado

  useEffect(() => {
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

  useEffect(() => {
    // Nova lógica para expansão da barra lateral com base na rota
    if (location.pathname === "/ai-chat") {
      setIsSidebarExpanded(true);
    } else {
      setIsSidebarExpanded(false);
    }
  }, [location.pathname]); // Depende de location.pathname

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
    <div
      className={cn(
        "fixed left-0 top-0 z-50 flex flex-col h-screen bg-card shadow-md transition-all duration-500 ease-in-out",
        isSidebarExpanded ? "w-64" : "w-20 group hover:w-64"
      )}
    >
      <div className="flex items-center justify-center group-hover:justify-start h-20 mb-6 py-4 px-4 relative">
        {/* Ícone para barra lateral minimizada */}
        <Printer
          className={cn(
            "h-8 w-8 text-primary absolute transition-all duration-500 ease-in-out",
            isSidebarExpanded ? "opacity-0" : "opacity-100 group-hover:opacity-0"
          )}
        />
        {/* Logo para barra lateral expandida */}
        <img
          src={mainLogoSrc}
          alt="Yooga Suporte Logo Completo"
          className={cn(
            "h-12 w-auto transition-all duration-500 ease-in-out",
            isSidebarExpanded ? "opacity-100 h-16" : "opacity-0 group-hover:opacity-100 group-hover:h-16"
          )}
        />
      </div>
      <nav className="flex-1 grid items-start gap-1 px-4">
        {/* Link customizado para Assistente Rogério com gradiente permanente */}
        <NavLink
          to="/ai-chat"
          className={({ isActive }) =>
            cn(
              "flex items-center rounded-lg transition-all duration-500 ease-in-out",
              "bg-gradient-primary text-white",
              isActive ? "font-semibold" : "",
              isSidebarExpanded ? "w-full" : "w-10 group-hover:w-full"
            )
          }
        >
          <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out",
              isSidebarExpanded
                ? "opacity-100 max-w-full ml-2"
                : "opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-full group-hover:ml-2"
            )}
          >
            Assistente Rogério
          </span>
        </NavLink>

        <SidebarLink to="/" icon={<Home className="h-4 w-4" />} label="Página Inicial" end isSidebarExpanded={isSidebarExpanded} />
        <SidebarLink to="/printers" icon={<Printer className="h-4 w-4" />} label="Impressoras" isSidebarExpanded={isSidebarExpanded} />
        <SidebarLink to="/scales" icon={<Scale className="h-4 w-4" />} label="Balanças" isSidebarExpanded={isSidebarExpanded} />
        <SidebarLink to="/utilities" icon={<Wrench className="h-4 w-4" />} label="Utilitários" isSidebarExpanded={isSidebarExpanded} />
        <SidebarLink to="/faq" icon={<BookOpen className="h-4 w-4" />} label="Dúvidas Recorrentes" isSidebarExpanded={isSidebarExpanded} />
        <a 
          href="https://wiki-suporte-yooga.notion.site/Impressoras-Configura-es-e-poss-veis-erros-1d6468d042e84ca88165b482df10b1da#1d6468d042e84ca88165b482df10b1da" 
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(
            "flex items-center rounded-lg text-muted-foreground transition-all hover:text-foreground",
            isSidebarExpanded ? "w-full" : "w-10 group-hover:w-full"
          )}
        >
          <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
            <Book className="h-4 w-4" />
          </div>
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out",
              isSidebarExpanded
                ? "opacity-100 max-w-full ml-2"
                : "opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-full group-hover:ml-2"
            )}
          >
            Wiki de Suporte
          </span>
        </a>
        <SidebarLink to="/suggestions" icon={<Lightbulb className="h-4 w-4" />} label="Sugestões" isSidebarExpanded={isSidebarExpanded} />
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
                  className={cn(
                    "text-white hover:bg-white/20 transition-all duration-500 ease-in-out",
                    isSidebarExpanded
                      ? "opacity-100 max-w-full"
                      : "opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-full"
                  )}
                >
                  <Shield className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={handleLogout} variant="ghost" size="icon" title="Sair"
                      className={cn(
                        "text-white hover:bg-white/20 transition-all duration-500 ease-in-out",
                        isSidebarExpanded
                          ? "opacity-100 max-w-full"
                          : "opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-full"
                      )}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate("/login")} variant="ghost" size="icon" title="Login Admin"
                    className={cn(
                      "text-white hover:bg-white/20 transition-all duration-500 ease-in-out",
                      isSidebarExpanded
                        ? "opacity-100 max-w-full"
                        : "opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-full"
                    )}>
              <LogIn className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};