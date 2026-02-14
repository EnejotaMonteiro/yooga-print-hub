
-- Tabela para utilitários fiscais
CREATE TABLE public.utilitarios_fiscais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  download_url TEXT NOT NULL,
  image_url TEXT,
  hidden_info TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.utilitarios_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for fiscal utilities" ON public.utilitarios_fiscais FOR SELECT USING (true);
CREATE POLICY "Admins can insert fiscal utilities" ON public.utilitarios_fiscais FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));
CREATE POLICY "Admins can update fiscal utilities" ON public.utilitarios_fiscais FOR UPDATE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));
CREATE POLICY "Admins can delete fiscal utilities" ON public.utilitarios_fiscais FOR DELETE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

-- Tabela para tutoriais fiscais
CREATE TABLE public.tutoriais_fiscais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  video_url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tutoriais_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active fiscal tutorials" ON public.tutoriais_fiscais FOR SELECT USING (ativo = true);
CREATE POLICY "Auth users can view all fiscal tutorials" ON public.tutoriais_fiscais FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can insert fiscal tutorials" ON public.tutoriais_fiscais FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update fiscal tutorials" ON public.tutoriais_fiscais FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete fiscal tutorials" ON public.tutoriais_fiscais FOR DELETE USING (auth.uid() IS NOT NULL);

-- Triggers de timestamp
CREATE TRIGGER update_utilitarios_fiscais_updated_at BEFORE UPDATE ON public.utilitarios_fiscais FOR EACH ROW EXECUTE FUNCTION public.atualiza_timestamp();
CREATE TRIGGER update_tutoriais_fiscais_updated_at BEFORE UPDATE ON public.tutoriais_fiscais FOR EACH ROW EXECUTE FUNCTION public.atualiza_timestamp();
