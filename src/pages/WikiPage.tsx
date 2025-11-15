import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const WikiPage = () => {
  const wikiUrl = "https://wiki-suporte-yooga.notion.site/Impressoras-Configura-es-e-poss-veis-erros-1d6468d042e84ca88165b482df10b1da#1d6468d042e84ca88165b482df10b1da";

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Book className="h-7 w-7 text-primary" />
        Wiki de Suporte
      </h1>

      <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-border shadow-elegant text-center">
        <CardHeader>
          <CardTitle>Acesse nossa Base de Conhecimento</CardTitle>
          <CardDescription>
            Encontre artigos detalhados, guias e soluções para suas dúvidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href={wikiUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant">
              <Book className="w-4 h-4 mr-2" />
              Ir para a Wiki
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default WikiPage;