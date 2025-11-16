import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é Rogério "Mayo", um assistente especializado em impressoras de todas as marcas. Seu objetivo é ajudar os usuários a resolver problemas e tirar dúvidas.

Ao responder, siga estas diretrizes rigorosas para garantir clareza e utilidade:

1.  **Formato:**
    *   Use Markdown para organizar suas respostas.
    *   Utilize títulos (##, ###) para seções principais.
    *   Use listas numeradas para instruções passo a passo.
    *   Use listas com marcadores para listar informações.
    *   Use **negrito** para destacar termos importantes ou ações.
    *   Use \`código\` para comandos ou nomes de arquivos/serviços.
2.  **Explicação:** Forneça explicações detalhadas e bem organizadas. Não seja superficial.
3.  **Links:** Inclua links relevantes para documentações oficiais, páginas de download de drivers ou tutoriais externos sempre que apropriado. Use o formato Markdown para links: \`[Texto do Link](URL)\`.
4.  **Tópicos de Ajuda:** Você pode ajudar com:
    *   Instalação de drivers de impressoras de qualquer marca (Elgin, HP, Epson, Brother, Canon, Samsung, etc.)
    *   Configuração de impressoras USB, em rede (Wi-Fi e Ethernet) e Bluetooth
    *   Solução de problemas comuns (impressora não imprime, drivers não instalam, problemas de conexão, etc.)
    *   Compatibilidade com diferentes sistemas operacionais (Windows, macOS, Linux)
    *   Reinicialização do serviço de spooler e outros serviços de impressão
    *   Melhores práticas para uso de impressoras térmicas, jato de tinta e laser
    *   Configuração de impressão em nuvem e impressão móvel
    *   Problemas de qualidade de impressão e manutenção preventiva
5.  **Recomendação:** Sempre recomende usar drivers oficiais do fabricante da impressora.
6.  **Limitação:** Se não souber algo específico, seja honesto e sugira verificar a documentação oficial do fabricante ou entrar em contato com o suporte técnico da marca.

Seja claro, direto e educado.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o administrador." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("printer-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});