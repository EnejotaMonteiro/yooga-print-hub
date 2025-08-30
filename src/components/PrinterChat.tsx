import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface Message {
  id: string;
  impressora_id: string;
  usuario_id: string;
  conteudo: string;
  criado_em: string;
  cor_usuario: string;
  perfil?: {
    nome: string;
  };
}

interface PrinterChatProps {
  printerId: string;
  user: any;
}

const userColors = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
  '#EF4444', '#06B6D4', '#84CC16', '#F97316'
];

const getUserColor = (userId: string) => {
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return userColors[Math.abs(hash) % userColors.length];
};

export const PrinterChat = ({ printerId, user }: PrinterChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Carregar mensagens existentes
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('mensagens_chat')
          .select(`
            *,
            perfil:perfis(nome)
          `)
          .eq('impressora_id', printerId)
          .order('criado_em', { ascending: true });

        if (error) {
          console.error('Erro ao carregar mensagens:', error);
          return;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('Erro inesperado:', error);
      }
    };

    loadMessages();

    // Configurar realtime para novas mensagens
    const channel = supabase
      .channel(`chat-${printerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_chat',
          filter: `impressora_id=eq.${printerId}`
        },
        async (payload) => {
          // Buscar o perfil do usuário para a nova mensagem
          const { data: perfilData } = await supabase
            .from('perfis')
            .select('nome')
            .eq('id', payload.new.usuario_id)
            .single();

          const newMessage = {
            ...payload.new,
            perfil: perfilData
          } as Message;

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [printerId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const userColor = getUserColor(user.id);
      
      const { error } = await supabase
        .from('mensagens_chat')
        .insert({
          impressora_id: printerId,
          usuario_id: user.id,
          conteudo: newMessage.trim(),
          cor_usuario: userColor
        });

      if (error) {
        toast({
          title: "Erro ao enviar mensagem",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setNewMessage("");
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Messages Container */}
      <Card className="h-96 overflow-hidden">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Seja o primeiro a enviar uma mensagem neste chat!
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.usuario_id === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage 
                          ? 'bg-gradient-primary text-white' 
                          : 'bg-white border shadow-sm'
                      }`}
                    >
                      {!isOwnMessage && (
                        <div 
                          className="text-xs font-semibold mb-1"
                          style={{ color: message.cor_usuario }}
                        >
                          {message.perfil?.nome || 'Usuário'}
                        </div>
                      )}
                      <div className={`text-sm ${isOwnMessage ? 'text-white' : 'text-foreground'}`}>
                        {message.conteudo}
                      </div>
                      <div className={`text-xs mt-1 ${isOwnMessage ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {new Date(message.criado_em).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="bg-gradient-primary hover:opacity-90 transition-smooth"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};