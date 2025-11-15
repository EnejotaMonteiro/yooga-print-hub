export interface Utility {
  id: string;
  name: string;
  description: string;
  downloadUrl: string;
}

export const utilities: Utility[] = [
  {
    id: "anydesk",
    name: "AnyDesk",
    description: "Software de acesso remoto para suporte técnico rápido e eficiente.",
    downloadUrl: "https://anydesk.com/pt/downloads/windows",
  },
  {
    id: "teamviewer",
    name: "TeamViewer",
    description: "Ferramenta de controle remoto para acesso a computadores e dispositivos móveis.",
    downloadUrl: "https://www.teamviewer.com/pt-br/download/",
  },
  {
    id: "adobe-reader",
    name: "Adobe Acrobat Reader DC",
    description: "Visualizador de PDF gratuito e padrão da indústria.",
    downloadUrl: "https://get.adobe.com/br/reader/",
  },
];