import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PrinterCardProps {
  name: string;
  image: string;
  downloadUrl: string;
}

export const PrinterCard = ({ name, image, downloadUrl }: PrinterCardProps) => {
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <Card className="group overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-elegant hover:shadow-glow transition-smooth hover:scale-105">
      <CardContent className="p-0">
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
          />
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">{name}</h3>
          <Button
            onClick={handleDownload}
            className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Driver
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};