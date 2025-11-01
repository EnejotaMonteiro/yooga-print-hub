-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar função para verificar roles (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Política para user_roles: apenas admins podem gerenciar
CREATE POLICY "Admins podem ver todas as roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Criar tabela de impressoras
CREATE TABLE public.impressoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  imagem_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  download_url TEXT NOT NULL,
  conexao_rede BOOLEAN DEFAULT false,
  windows_recomendado TEXT DEFAULT 'Windows 7, 8, 10, 11',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela impressoras
ALTER TABLE public.impressoras ENABLE ROW LEVEL SECURITY;

-- Políticas para impressoras: todos podem ver, apenas admins podem modificar
CREATE POLICY "Todos podem ver impressoras ativas"
  ON public.impressoras
  FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admins podem ver todas as impressoras"
  ON public.impressoras
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir impressoras"
  ON public.impressoras
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar impressoras"
  ON public.impressoras
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar impressoras"
  ON public.impressoras
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_impressoras_updated_at
  BEFORE UPDATE ON public.impressoras
  FOR EACH ROW
  EXECUTE FUNCTION public.atualiza_timestamp();

-- Criar tabela de configurações do site
CREATE TABLE public.configuracao_site (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_guia_universal_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela configuracao_site
ALTER TABLE public.configuracao_site ENABLE ROW LEVEL SECURITY;

-- Políticas para configuracao_site: todos podem ver, apenas admins podem modificar
CREATE POLICY "Todos podem ver configurações"
  ON public.configuracao_site
  FOR SELECT
  USING (true);

CREATE POLICY "Admins podem atualizar configurações"
  ON public.configuracao_site
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Inserir configuração inicial
INSERT INTO public.configuracao_site (video_guia_universal_url)
VALUES ('https://www.youtube.com/embed/dQw4w9WgXcQ');

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_configuracao_site_updated_at
  BEFORE UPDATE ON public.configuracao_site
  FOR EACH ROW
  EXECUTE FUNCTION public.atualiza_timestamp();