export interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  keywords: string[];
}

export const tutorials: Tutorial[] = [
  {
    id: "reiniciar-spooler",
    title: "Como reiniciar o spooler de impressão",
    description: "Passo a passo completo para reiniciar o serviço de spooler do Windows, solucionando a maioria dos problemas de impressão travada ou fila de impressão bloqueada.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["spooler", "reiniciar", "fila", "travado", "bloqueado", "serviço"]
  },
  {
    id: "instalacao-manual-driver",
    title: "Instalação manual de driver",
    description: "Como instalar drivers de impressora manualmente quando o Windows não reconhece automaticamente.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["driver", "manual", "instalar", "inf", "windows", "instalação"]
  },
  {
    id: "configurar-impressora-rede",
    title: "Configurar impressora na rede",
    description: "Como configurar sua impressora para funcionar em rede local, incluindo configuração de IP, compartilhamento e acesso de múltiplos computadores.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["rede", "ip", "compartilhar", "local", "múltiplos", "computadores"]
  },
  {
    id: "diagnostico-conexao",
    title: "Diagnóstico de conexão",
    description: "Como verificar e diagnosticar problemas de conexão entre computador e impressora.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["conexão", "cabo", "porta", "diagnóstico", "verificar", "configuração"]
  },
  {
    id: "limpeza-manutencao",
    title: "Limpeza e manutenção",
    description: "Procedimentos básicos de limpeza e manutenção preventiva para impressoras.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["limpeza", "cabeçote", "manutenção", "produtos", "cuidados"]
  },
  {
    id: "otimizar-qualidade",
    title: "Otimizar qualidade de impressão",
    description: "Ajustes para melhorar a qualidade, densidade e velocidade de impressão.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["qualidade", "densidade", "velocidade", "clara", "borrada", "otimizar"]
  }
];