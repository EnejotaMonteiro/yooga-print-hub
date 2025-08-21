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
    id: "Em construção...",
    title: "Em construção...",
    description: "Em construção...",
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
    id: "Em construção...",
    title: "Em construção...",
    description: "Em construção...",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["conexão", "cabo", "porta", "diagnóstico", "verificar", "configuração"]
  },
  {
    id: "Em construção...",
    title: "Em construção...",
    description: "Em construção...",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["limpeza", "cabeçote", "manutenção", "produtos", "cuidados"]
  },
  {
    id: "Em construção...",
    title: "Em construção...",
    description: "Em construção...",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["qualidade", "densidade", "velocidade", "clara", "borrada", "otimizar"]
  }
];