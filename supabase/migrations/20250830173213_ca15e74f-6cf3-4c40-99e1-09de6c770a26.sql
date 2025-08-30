-- Criar tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS public.mensagens_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  impressora_id text NOT NULL,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conteudo text NOT NULL,
  criado_em timestamp DEFAULT now(),
  cor_usuario text DEFAULT '#3B82F6'
);

-- Habilitar RLS na tabela mensagens_chat
ALTER TABLE public.mensagens_chat ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mensagens_chat
CREATE POLICY "Todos podem ver mensagens"
ON public.mensagens_chat
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem enviar mensagens"
ON public.mensagens_chat
FOR INSERT
TO authenticated
WITH CHECK (usuario_id = auth.uid());

-- Habilitar realtime para as mensagens
ALTER TABLE public.mensagens_chat REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação realtime (apenas se não existir)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens_chat;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;