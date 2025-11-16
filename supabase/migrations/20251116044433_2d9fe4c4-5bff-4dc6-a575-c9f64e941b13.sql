-- Fix critical security issue: Require authentication to view user profiles
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.perfis;

CREATE POLICY "Authenticated users can view profiles"
ON public.perfis
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix critical security issue: Require authentication to view chat messages
DROP POLICY IF EXISTS "Todos podem ver mensagens" ON public.mensagens_chat;

CREATE POLICY "Authenticated users can view messages"
ON public.mensagens_chat
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Optional: Further restrict chat messages to only the message owner
-- Uncomment if you want users to only see their own messages:
-- DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.mensagens_chat;
-- CREATE POLICY "Users can view own messages"
-- ON public.mensagens_chat
-- FOR SELECT
-- TO authenticated
-- USING (usuario_id = auth.uid());