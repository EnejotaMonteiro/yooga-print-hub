import printerI9 from "@/assets/printer-elgin-i9.jpg";
import printerI7 from "@/assets/printer-elgin-i7.jpg";
import printerL42Pro from "@/assets/printer-elgin-l42-pro.jpg";
import printerTT042 from "@/assets/printer-elgin-tt042.jpg";
import printerL42 from "@/assets/printer-elgin-l42.jpg";
import printerI8 from "@/assets/printer-elgin-i8.jpg";

export interface Printer {
  id: string;
  name: string;
  image: string;
  downloadUrl: string;
}

export const printers: Printer[] = [
  {
    id: "1",
    name: "ELGIN I9",
    image: printerI9,
    downloadUrl: "https://example.com/drivers/elgin-i9.zip"
  },
  {
    id: "2", 
    name: "ELGIN I7",
    image: printerI7,
    downloadUrl: "https://example.com/drivers/elgin-i7.zip"
  },
  {
    id: "3",
    name: "ELGIN L42 PRO",
    image: printerL42Pro, 
    downloadUrl: "https://example.com/drivers/elgin-l42-pro.zip"
  },
  {
    id: "4",
    name: "ELGIN TT042",
    image: printerTT042,
    downloadUrl: "https://example.com/drivers/elgin-tt042.zip"
  },
  {
    id: "5",
    name: "ELGIN L42",
    image: printerL42,
    downloadUrl: "https://example.com/drivers/elgin-l42.zip"
  },
  {
    id: "6",
    name: "ELGIN I8",
    image: printerI8,
    downloadUrl: "https://example.com/drivers/elgin-i8.zip"
  }
];