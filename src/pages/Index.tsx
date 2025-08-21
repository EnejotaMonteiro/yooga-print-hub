import { useState } from "react";
import { PrinterCard } from "@/components/PrinterCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { printers } from "@/data/printers";
import yoogaLogo from "@/assets/yooga-logo.png";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPrinters = printers.filter(printer =>
    printer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Wiki Link Bar */}
      <div className="w-full bg-gradient-primary py-2">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <a 
              href="https://wiki-suporte-yooga.notion.site/Impressoras-Configura-es-e-poss-veis-erros-1d6468d042e84ca88165b482df10b1da"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white hover:text-white/80 transition-colors underline"
            >
              📚 Wiki Impressoras - Configurações e Possíveis Erros
            </a>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="container mx-auto px-4 pt-8 pb-8">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/31bbabfd-0146-4c41-84be-fc271db11663.png"
            alt="Yooga Suporte Logo" 
            className="h-16 md:h-20"
          />
        </div>

        {/* Universal Configuration Video */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-elegant overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-center text-foreground">
                Guia Universal de Configuração
              </h3>
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Guia Universal de Configuração de Impressoras"
                  className="w-full h-full rounded"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 pb-4">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      </div>

      {/* Printers Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredPrinters.map((printer) => (
            <PrinterCard
              key={printer.id}
              name={printer.name}
              videoUrl={printer.videoUrl}
              downloadUrl={printer.downloadUrl}
              networkConnection={printer.networkConnection}
              recommendedWindows={printer.recommendedWindows}
            />
          ))}
          {filteredPrinters.length === 0 && searchTerm && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Nenhuma impressora encontrada para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="faq" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="faq">Dúvidas Recorrentes</TabsTrigger>
          </TabsList>
          <TabsContent value="faq" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video 1 */}
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-elegant overflow-hidden">
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-3 text-foreground">
                    Como instalar drivers manualmente
                  </h4>
                  <div className="aspect-video mb-3">
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Como instalar drivers manualmente"
                      className="w-full h-full rounded"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aprenda o passo a passo para instalar drivers de impressora manualmente no Windows.
                  </p>
                </div>
              </div>

              {/* Video 2 */}
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-elegant overflow-hidden">
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-3 text-foreground">
                    Configuração de impressora em rede
                  </h4>
                  <div className="aspect-video mb-3">
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Configuração de impressora em rede"
                      className="w-full h-full rounded"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Como configurar sua impressora para funcionar na rede local.
                  </p>
                </div>
              </div>

              {/* Video 3 */}
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-elegant overflow-hidden">
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-3 text-foreground">
                    Resolução de problemas comuns
                  </h4>
                  <div className="aspect-video mb-3">
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Resolução de problemas comuns"
                      className="w-full h-full rounded"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Soluções para os erros mais frequentes em impressoras.
                  </p>
                </div>
              </div>

              {/* Video 4 */}
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-elegant overflow-hidden">
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-3 text-foreground">
                    Configurações avançadas do sistema
                  </h4>
                  <div className="aspect-video mb-3">
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Configurações avançadas do sistema"
                      className="w-full h-full rounded"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configurações avançadas para otimizar o funcionamento das impressoras.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-card/60 backdrop-blur-sm border-t border-white/20 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 Yooga Suporte - Drivers de impressoras
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
