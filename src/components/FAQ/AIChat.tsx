import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Image as ImageIcon, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client"; // Importar o cliente Supabase

interface Message {
  role: "user" | "assistant";
  content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>;
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Aiai cara, Olá! Sou seu Assistente Virtual, especializado em impressoras de todas as marcas e balanças para o mercado de restaurantes. Como posso ajudá-lo hoje?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    setUploadingImage(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Se o usuário estiver autenticado, usa o ID do usuário. Caso contrário, usa uma pasta genérica.
      const folderPath = userId ? `${userId}` : 'public_uploads';
      const filePath = `${folderPath}/${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('ai-chat-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('ai-chat-images')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro no upload da imagem", {
        description: error instanceof Error ? error.message : "Não foi possível enviar a imagem.",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!input.trim() && !selectedImage) || isLoading) return;

    setIsLoading(true);
    let imageUrl: string | null = null;

    if (selectedImage) {
      imageUrl = await uploadImageToSupabase(selectedImage);
      if (!imageUrl) {
        setIsLoading(false);
        return;
      }
    }

    const userMessageContent: Message["content"] = [];
    if (input.trim()) {
      userMessageContent.push({ type: "text", text: input.trim() });
    }
    if (imageUrl) {
      userMessageContent.push({ type: "image_url", image_url: { url: imageUrl } });
    }

    const userMessage: Message = { role: "user", content: userMessageContent };
    
    setInput("");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setMessages(prev => [...prev, userMessage]);

    let assistantContent = "";

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printer-chat`;
      
      const messagesToSend = messages.map(msg => {
        if (typeof msg.content === 'string') {
          return { role: msg.role, content: msg.content };
        } else {
          // Convert content array to the format expected by the AI gateway
          return {
            role: msg.role,
            content: msg.content.map(item => {
              if (item.type === 'text') return { type: 'text', text: item.text };
              if (item.type === 'image_url') return { type: 'image_url', image_url: { url: item.image_url?.url, detail: "auto" } };
              return item;
            })
          };
        }
      });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messagesToSend, userMessage] }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast.error("Limite excedido", {
            description: "Muitas requisições. Aguarde um momento e tente novamente.",
          });
          setIsLoading(false);
          return;
        }
        if (resp.status === 402) {
          toast.error("Créditos insuficientes", {
            description: "Entre em contato com o administrador do sistema.",
          });
          setIsLoading(false);
          return;
        }
        throw new Error("Falha ao iniciar chat");
      }

      if (!resp.body) throw new Error("Sem resposta do servidor");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      setMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Erro", {
        description: "Não foi possível enviar a mensagem. Tente novamente.",
      });
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col flex-1 bg-card/80 backdrop-blur-sm border-border shadow-elegant h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          Assistente Virtual
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 p-0 min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0" ref={messagesContainerRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  } prose prose-sm dark:prose-invert`}
                >
                  {typeof message.content === 'string' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        {item.type === 'text' && (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {item.text || ''}
                          </ReactMarkdown>
                        )}
                        {item.type === 'image_url' && item.image_url?.url && (
                          <img 
                            src={item.image_url.url} 
                            alt="Imagem enviada" 
                            className="max-w-full h-auto rounded-md mt-2" 
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Digitando...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 pt-4 mt-auto px-6 pb-6 border-t border-border shrink-0">
          <div className="relative flex-1">
            {selectedImage && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-card border border-border rounded-lg flex items-center gap-2">
                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-10 w-10 object-cover rounded" />
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">{selectedImage.name}</span>
                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveImage} className="h-6 w-6">
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida sobre impressoras ou balanças..."
              disabled={isLoading || uploadingImage}
              className="flex-1 pr-10"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Anexar imagem"
              disabled={isLoading || uploadingImage}
            >
              {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            type="submit"
            disabled={isLoading || uploadingImage || (!input.trim() && !selectedImage)}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};