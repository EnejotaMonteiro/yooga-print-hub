-- Habilita RLS na tabela perfis
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Cria políticas RLS para perfis
CREATE POLICY "Usuários podem ver todos os perfis"
ON public.perfis
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.perfis
FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Usuários podem inserir seu próprio perfil"
ON public.perfis
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Cria tabela de mensagens do chat
CREATE TABLE public.mensagens_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  impressora_id text NOT NULL,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conteudo text NOT NULL,
  criado_em timestamp DEFAULT now(),
  cor_usuario text DEFAULT '#3B82F6'
);

-- Habilita RLS na tabela mensagens_chat
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

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (id, nome)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', new.email));
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Habilita realtime para as mensagens
ALTER TABLE public.mensagens_chat REPLICA IDENTITY FULL;
INSERT INTO supabase_realtime.subscription (
  id, 
  subscription_id, 
  entity, 
  filters, 
  claims, 
  created_at
) VALUES (
  gen_random_uuid(),
  gen_random_uuid(), 
  'public.mensagens_chat',
  '{}',
  '{}',
  now()
);

-- Adiciona a tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens_chat;