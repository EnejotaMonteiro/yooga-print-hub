export interface Printer {
  id: string;
  name: string;
  videoUrl: string;
  downloadUrl: string;
}

export const printers: Printer[] = [
  {
    id: "1",
    name: "Bematech 4200TH",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    downloadUrl: "https://example.com/drivers/bematech-4200th.zip"
  },
  {
    id: "2", 
    name: "Bematech 4200 HS",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    downloadUrl: "https://example.com/drivers/bematech-4200hs.zip"
  },
  {
    id: "3",
    name: "Bematech 100s",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
    downloadUrl: "https://example.com/drivers/bematech-100s.zip"
  },
  {
    id: "4",
    name: "Bematech 2500",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    downloadUrl: "https://example.com/drivers/bematech-2500.zip"
  },
  {
    id: "5",
    name: "Bematech 4000",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    downloadUrl: "https://example.com/drivers/bematech-4000.zip"
  },
  {
    id: "6",
    name: "POS 80",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    downloadUrl: "https://example.com/drivers/pos-80.zip"
  },
  {
    id: "7",
    name: "POS 58",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    downloadUrl: "https://example.com/drivers/pos-58.zip"
  },
  {
    id: "8",
    name: "Epson T20",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    downloadUrl: "https://example.com/drivers/epson-t20.zip"
  },
  {
    id: "9",
    name: "Epson T20X",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    downloadUrl: "https://example.com/drivers/epson-t20x.zip"
  }
];