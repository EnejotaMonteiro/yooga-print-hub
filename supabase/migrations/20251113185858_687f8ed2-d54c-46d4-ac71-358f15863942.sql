-- Remove as políticas antigas de user_roles
DROP POLICY IF EXISTS "Usuários autenticados podem ver roles" ON user_roles;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir roles" ON user_roles;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar roles" ON user_roles;

-- Cria novas políticas que permitem apenas super_admins gerenciar roles
CREATE POLICY "Super admins podem ver todas as roles"
ON user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins podem inserir roles"
ON user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins podem deletar roles"
ON user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));