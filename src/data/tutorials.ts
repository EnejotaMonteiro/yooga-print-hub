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
    id: "instalar-drivers-manualmente",
    title: "Instalação manual de drivers",
    description: "Tutorial detalhado para instalar drivers de impressora manualmente no Windows, incluindo como localizar e executar arquivos .inf e solucionar erros comuns de instalação.",
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
    id: "resolver-problemas-conexao",
    title: "Resolver problemas de conexão",
    description: "Diagnóstico e solução dos problemas mais comuns de conexão entre computador e impressora, incluindo verificação de cabos, portas e configurações.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["conexão", "cabo", "porta", "diagnóstico", "verificar", "configuração"]
  },
  {
    id: "limpar-cabecote-impressao",
    title: "Limpeza do cabeçote de impressão",
    description: "Procedimento correto para limpeza do cabeçote de impressão, quando fazer, produtos recomendados e cuidados especiais para cada tipo de impressora.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["limpeza", "cabeçote", "manutenção", "produtos", "cuidados"]
  },
  {
    id: "configurar-qualidade-impressao",
    title: "Ajustar qualidade de impressão",
    description: "Como configurar e otimizar a qualidade de impressão, ajustar densidade, velocidade e resolver problemas de impressão clara ou borrada.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keywords: ["qualidade", "densidade", "velocidade", "clara", "borrada", "otimizar"]
  }
];