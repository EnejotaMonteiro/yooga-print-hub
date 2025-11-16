import { Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ScalesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Scale className="h-7 w-7 text-primary" />
        Balanças
      </h1>

      <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-border shadow-elegant">
        <CardHeader>
          <CardTitle>Página de Balanças</CardTitle>
          <CardDescription>
            Conteúdo sobre balanças será adicionado aqui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta é uma página de placeholder para as informações e utilitários relacionados a balanças.
            Em breve, você encontrará guias de configuração, drivers e soluções para problemas comuns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScalesPage;