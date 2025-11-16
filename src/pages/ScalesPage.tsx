import { Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScaleDownloadCard } from "@/components/ScaleDownloadCard"; // Importar o novo componente

const ScalesPage = () => {
  // Dados de exemplo para o driver de balança
  const scaleData = {
    name: "Driver de Balança Toledo",
    description: "Driver universal para balanças Toledo, compatível com diversos modelos.",
    downloadUrl: "https://www.toledobrasil.com.br/pt/suporte/downloads", // URL de exemplo
    imageUrl: "https://www.toledobrasil.com.br/images/default-source/produtos/balancas-comerciais/prix-3-fit.png?sfvrsn=2", // Imagem de exemplo
  };

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Scale className="h-7 w-7 text-primary" />
        Balanças
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <ScaleDownloadCard
          name={scaleData.name}
          description={scaleData.description}
          downloadUrl={scaleData.downloadUrl}
          imageUrl={scaleData.imageUrl}
        />
      </div>
    </div>
  );
};

export default ScalesPage;