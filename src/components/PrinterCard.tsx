import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Network, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

interface PrinterCardProps {
  name: string;
  videoUrl: string;
  downloadUrl: string;
  networkConnection: boolean;
  recommendedWindows: string;
}

export const PrinterCard = ({ name, videoUrl, downloadUrl, networkConnection, recommendedWindows }: PrinterCardProps) => {
  const [observation, setObservation] = useState("");
  
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
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {networkConnection ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span>
                {networkConnection ? "Funciona por cabo de rede" : "Não funciona por cabo de rede"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Windows recomendado:</strong> {recommendedWindows}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={`observation-${name}`} className="text-sm font-medium text-foreground">
              Observações:
            </label>
            <Textarea
              id={`observation-${name}`}
              placeholder="Adicione suas observações sobre esta impressora..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};