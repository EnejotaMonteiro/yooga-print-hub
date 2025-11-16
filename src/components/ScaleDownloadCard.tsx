import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ScaleDownloadCardProps {
  name: string;
  description: string;
  downloadUrl: string;
  imageUrl?: string | null;
}

export const ScaleDownloadCard = ({
  name,
  description,
  downloadUrl,
  imageUrl,
}: ScaleDownloadCardProps) => {
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <Card className="group overflow-hidden bg-card/80 backdrop-blur-sm border-border/20 shadow-elegant relative transition-smooth hover:scale-105">
      {imageUrl && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className={imageUrl ? "pt-4" : ""}>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </a>
      </CardContent>
    </Card>
  );
};