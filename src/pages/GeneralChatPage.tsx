import { useState, useEffect } from "react";
import { MessageSquareText } from "lucide-react";
import { PrinterChat } from "@/components/PrinterChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // Usar toast do sonner
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const GENERAL_CHAT_PRINTER_ID = "general-chat-id"; // ID fictício para o chat geral

const GeneralChatPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setLoadingUser(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erro ao buscar sessão:", error);
        toast.error("Erro de autenticação", {
          description: "Não foi possível carregar as informações do usuário.",
        });
      }
      setUser(session?.user || null);
      setLoadingUser(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loadingUser) {
    return (
      <div className="container mx-auto px-4 py-8 md:pl-8 flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 md:pl-8">
        <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-border shadow-elegant text-center">
          <CardHeader>
            <CardTitle>Acesso Restrito ao Chat</CardTitle>
            <CardDescription>
              Você precisa estar logado para participar do chat geral.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Por favor, faça login para enviar e visualizar mensagens.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <MessageSquareText className="h-7 w-7 text-primary" />
        Chat Geral
      </h1>

      <div className="max-w-3xl mx-auto">
        <PrinterChat printerId={GENERAL_CHAT_PRINTER_ID} user={user} />
      </div>
    </div>
  );
};

export default GeneralChatPage;