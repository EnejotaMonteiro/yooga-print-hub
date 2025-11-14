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
  nome_usuario?: string;
}

interface PrinterChatProps {
  printerId: string;
  user: any;
  compact?: boolean;
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

export const PrinterChat = ({ printerId, user, compact = false }: PrinterChatProps) => {
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
      console.log('Carregando mensagens para impressora:', printerId);
      try {
        // Query direta para mensagens
        const { data, error } = await supabase
          .from('mensagens_chat')
          .select('*')
          .eq('impressora_id', printerId)
          .order('criado_em', { ascending: true });

        if (error) {
          console.error('Erro ao carregar mensagens:', error);
          return;
        }

        console.log('Mensagens carregadas:', data?.length || 0);

        if (data) {
          const messagesWithProfiles: Message[] = [];
          for (const msg of data) {
            const { data: profile } = await supabase
              .from('perfis')
              .select('nome')
              .eq('id', msg.usuario_id)
              .maybeSingle();
            
            messagesWithProfiles.push({
              id: msg.id,
              impressora_id: msg.impressora_id,
              usuario_id: msg.usuario_id,
              conteudo: msg.conteudo,
              criado_em: msg.criado_em,
              cor_usuario: msg.cor_usuario,
              nome_usuario: profile?.nome || 'Usuário'
            });
          }
          setMessages(messagesWithProfiles);
        }
      } catch (error) {
        console.error('Erro inesperado ao carregar mensagens:', error);
        setMessages([]);
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
        async (payload: any) => {
          console.log('Nova mensagem recebida via realtime:', payload.new);
          
          // Buscar o perfil do usuário para a nova mensagem
          const { data: perfilData } = await supabase
            .from('perfis')
            .select('nome')
            .eq('id', payload.new.usuario_id)
            .maybeSingle();

          const newMessage: Message = {
            id: payload.new.id,
            impressora_id: payload.new.impressora_id,
            usuario_id: payload.new.usuario_id,
            conteudo: payload.new.conteudo,
            criado_em: payload.new.criado_em,
            cor_usuario: payload.new.cor_usuario,
            nome_usuario: perfilData?.nome || 'Usuário'
          };

          setMessages(prev => {
            // Verificar se a mensagem já existe para evitar duplicatas
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    console.log('Canal realtime configurado para:', `chat-${printerId}`);

    return () => {
      console.log('Removendo canal realtime');
      supabase.removeChannel(channel);
    };
  }, [printerId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    console.log('Enviando mensagem:', newMessage.trim(), 'para impressora:', printerId);
    setLoading(true);
    
    try {
      const userColor = getUserColor(user.id);
      
      const { data, error } = await supabase
        .from('mensagens_chat')
        .insert({
          impressora_id: printerId,
          usuario_id: user.id,
          conteudo: newMessage.trim(),
          cor_usuario: userColor
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast({
          title: "Erro ao enviar mensagem",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Mensagem enviada com sucesso:', data);
      setNewMessage("");
      
    } catch (error) {
      console.error('Erro inesperado ao enviar mensagem:', error);
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
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {/* Messages Container */}
      <Card className={`${compact ? "h-48" : "h-96"} overflow-hidden`}>
        <CardContent className={`${compact ? "p-3" : "p-4"} h-full flex flex-col`}>
          <div className={`flex-1 overflow-y-auto ${compact ? "space-y-2" : "space-y-3"} pr-2`}>
            {messages.length === 0 ? (
              <div className={`text-center text-muted-foreground ${compact ? "py-4 text-xs" : "py-8"}`}>
                {compact ? "Nenhuma mensagem ainda" : "Seja o primeiro a enviar uma mensagem neste chat!"}
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
                      className={`${compact ? "max-w-xs px-3 py-1" : "max-w-xs lg:max-w-md px-4 py-2"} rounded-lg ${
                        isOwnMessage 
                          ? 'bg-gradient-primary text-white' 
                          : 'bg-card border shadow-sm' // Alterado de bg-white para bg-card
                      }`}
                    >
                      {!isOwnMessage && (
                        <div 
                          className={`${compact ? "text-xs" : "text-xs"} font-semibold mb-1`}
                          style={{ color: message.cor_usuario }}
                        >
                          {message.nome_usuario || 'Usuário'}
                        </div>
                      )}
                      <div className={`${compact ? "text-xs" : "text-sm"} ${isOwnMessage ? 'text-white' : 'text-foreground'}`}>
                        {message.conteudo}
                      </div>
                      <div className={`text-xs ${compact ? "mt-0.5" : "mt-1"} ${isOwnMessage ? 'text-white/80' : 'text-muted-foreground'}`}>
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
          placeholder={compact ? "Mensagem..." : "Digite sua mensagem..."}
          disabled={loading}
          className={`flex-1 ${compact ? "h-8 text-sm" : ""}`}
        />
        <Button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className={`bg-gradient-primary hover:opacity-90 transition-smooth ${compact ? "h-8 px-3" : ""}`}
        >
          <Send className={compact ? "w-3 h-3" : "w-4 h-4"} />
        </Button>
      </form>
    </div>
  );
};