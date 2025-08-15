export interface Printer {
  id: string;
  name: string;
  videoUrl: string;
  downloadUrl: string;
  networkConnection: boolean;
  recommendedWindows: string;
}

export const printers: Printer[] = [
  {
    id: "1",
    name: "Bematech ",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=UUvjUM98AY2QxxL2Iq8dRrFw",
    downloadUrl: "https://example.com/drivers/bematech-4200th.zip",
    networkConnection: true,
    recommendedWindows: "Windows 7/8/10/11"
  },
  {
    id: "2", 
    name: "Bematech 4200 HS",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=UUvjUM98AY2QxxL2Iq8dRrFw",
    downloadUrl: "https://example.com/drivers/bematech-4200hs.zip",
    networkConnection: true,
    recommendedWindows: "Windows 7/8/10/11"
  },
  {
    id: "3",
    name: "Bematech 100s",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=UUvjUM98AY2QxxL2Iq8dRrFw", 
    downloadUrl: "https://example.com/drivers/bematech-100s.zip",
    networkConnection: true,
    recommendedWindows: "Windows XP/7/8/10"
  },
  {
    id: "4",
    name: "Bematech 2500",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=UUvjUM98AY2QxxL2Iq8dRrFw",
    downloadUrl: "https://example.com/drivers/bematech-2500.zip",
    networkConnection: true,
    recommendedWindows: "Windows XP/7/8/10"
  },
  {
    id: "5",
    name: "Bematech 4000",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=UUvjUM98AY2QxxL2Iq8dRrFw",
    downloadUrl: "https://example.com/drivers/bematech-4000.zip",
    networkConnection: true,
    recommendedWindows: "Windows 7/8/10/11"
  },
  {
    id: "6",
    name: "POS 80",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=UUvjUM98AY2QxxL2Iq8dRrFw",
    downloadUrl: "https://example.com/drivers/pos-80.zip",
    networkConnection: true,
    recommendedWindows: "Windows XP/7/8/10/11"
  },
  {
    id: "7",
    name: "POS 58",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=UUvjUM98AY2QxxL2Iq8dRrFw",
    downloadUrl: "https://example.com/drivers/pos-58.zip",
    networkConnection: true,
    recommendedWindows: "Windows XP/7/8/10/11"
  },
  {
    id: "8",
    name: "Epson T20",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=UUvjUM98AY2QxxL2Iq8dRrFw",
    downloadUrl: "https://example.com/drivers/epson-t20.zip",
    networkConnection: true,
    recommendedWindows: "Windows 7/8/10/11"
  },
  {
    id: "9",
    name: "Epson T20X",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=UUvjUM98AY2QxxL2Iq8dRrFw",
    downloadUrl: "https://example.com/drivers/epson-t20x.zip",
    networkConnection: true,
    recommendedWindows: "Windows 7/8/10/11"
  },
  {
    id: "10",
    name: "Epson teste 2020",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=UUvjUM98AY2QxxL2Iq8dRrFw",
    downloadUrl: "https://example.com/drivers/epson-t20x.zip",
    networkConnection: true,
    recommendedWindows: "Windows 10/22"]}