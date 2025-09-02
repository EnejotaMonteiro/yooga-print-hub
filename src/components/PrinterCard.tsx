import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrinterChat } from "@/components/PrinterChat";
import { Download } from "lucide-react";

interface PrinterCardProps {
  name: string;
  videoUrl: string;
  downloadUrl: string;
  networkConnection: boolean;
  recommendedWindows: string;
  printerId: string;
  user: any;
}

export const PrinterCard = ({ name, videoUrl, downloadUrl, networkConnection, recommendedWindows, printerId, user }: PrinterCardProps) => {
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <Card className="group overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-elegant hover:shadow-glow transition-smooth hover:scale-105">
      <CardContent className="p-0">
        <div className="aspect-video overflow-hidden">
          <iframe
            src={videoUrl}
            title={`${name} - Configuração e Funcionamento`}
            className="w-full h-full rounded-t-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">{name}</h3>
          <Button
            onClick={handleDownload}
            className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant mb-4"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Driver
          </Button>
          
          <div className="text-sm text-muted-foreground mb-4">
            <strong>Windows recomendado:</strong> {recommendedWindows}
          </div>

          {/* Chat integrado */}
          <div className="border-t border-white/20 pt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Chat de Suporte</h4>
            <PrinterChat printerId={printerId} user={user} compact={true} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};