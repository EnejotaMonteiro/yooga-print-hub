import { Download, Tool } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { utilities } from "@/data/utilities"; // Importar os dados dos utilitários

const UtilitiesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Tool className="h-7 w-7 text-primary" />
        Utilitários
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {utilities.map((utility) => (
          <Card key={utility.id} className="bg-card/80 backdrop-blur-sm border-border/20 shadow-elegant">
            <CardHeader>
              <CardTitle>{utility.name}</CardTitle>
              <CardDescription>{utility.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <a href={utility.downloadUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UtilitiesPage;