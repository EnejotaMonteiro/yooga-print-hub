-- Criar tabela de tutoriais/dúvidas recorrentes
CREATE TABLE public.tutoriais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  video_url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutoriais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos podem ver tutoriais ativos"
ON public.tutoriais
FOR SELECT
USING (ativo = true);

CREATE POLICY "Usuários autenticados podem ver todos os tutoriais"
ON public.tutoriais
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem inserir tutoriais"
ON public.tutoriais
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar tutoriais"
ON public.tutoriais
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar tutoriais"
ON public.tutoriais
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER atualiza_tutoriais_timestamp
BEFORE UPDATE ON public.tutoriais
FOR EACH ROW
EXECUTE FUNCTION public.atualiza_timestamp();

-- Inserir tutoriais iniciais
INSERT INTO public.tutoriais (titulo, descricao, video_url, ordem) VALUES
('Como reiniciar o spooler de impressão', 'Passo a passo completo para reiniciar o serviço de spooler do Windows, solucionando a maioria dos problemas de impressão travada ou fila de impressão bloqueada.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
('Instalação manual de driver', 'Como instalar drivers de impressora manualmente quando o Windows não reconhece automaticamente.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2),
('Configurar impressora na rede', 'Como configurar sua impressora para funcionar em rede local, incluindo configuração de IP, compartilhamento e acesso de múltiplos computadores.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3);