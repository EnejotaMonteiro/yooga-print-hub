-- Remove as políticas antigas que exigem role de admin
DROP POLICY IF EXISTS "Admins podem inserir impressoras" ON impressoras;
DROP POLICY IF EXISTS "Admins podem atualizar impressoras" ON impressoras;
DROP POLICY IF EXISTS "Admins podem deletar impressoras" ON impressoras;
DROP POLICY IF EXISTS "Admins podem ver todas as impressoras" ON impressoras;

-- Cria novas políticas que permitem qualquer usuário autenticado gerenciar impressoras
CREATE POLICY "Usuários autenticados podem inserir impressoras"
ON impressoras
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar impressoras"
ON impressoras
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar impressoras"
ON impressoras
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem ver todas as impressoras"
ON impressoras
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Remove e recria as políticas da tabela user_roles
DROP POLICY IF EXISTS "Admins podem ver todas as roles" ON user_roles;
DROP POLICY IF EXISTS "Admins podem inserir roles" ON user_roles;
DROP POLICY IF EXISTS "Admins podem deletar roles" ON user_roles;

CREATE POLICY "Usuários autenticados podem ver roles"
ON user_roles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem inserir roles"
ON user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar roles"
ON user_roles
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Remove e recria as políticas da tabela configuracao_site
DROP POLICY IF EXISTS "Admins podem atualizar configurações" ON configuracao_site;

CREATE POLICY "Usuários autenticados podem atualizar configurações"
ON configuracao_site
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);