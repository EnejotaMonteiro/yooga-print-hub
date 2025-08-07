import { useState } from "react";
import { PrinterCard } from "@/components/PrinterCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { printers } from "@/data/printers";
import yoogaLogo from "@/assets/yooga-logo.png";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPrinters = printers.filter(printer =>
    printer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="container mx-auto px-4 pt-8 pb-8">
        {/* Wiki Button at top */}
        <div className="mb-8 text-center">
          <Button 
            asChild
            variant="default"
            size="default"
            className="bg-gradient-primary text-white hover:opacity-90 transition-smooth mb-6"
          >
            <a 
              href="https://wiki-suporte-yooga.notion.site/Impressoras-Configura-es-e-poss-veis-erros-1d6468d042e84ca88165b482df10b1da"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wiki Impressoras
            </a>
          </Button>
        </div>

        {/* Logo */}
        <div className="mb-8 text-center">
          <img 
            src="/lovable-uploads/31bbabfd-0146-4c41-84be-fc271db11663.png"
            alt="Yooga Suporte Logo" 
            className="h-16 md:h-20 mx-auto"
          />
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

      {/* Footer */}
      <footer className="bg-card/60 backdrop-blur-sm border-t border-white/20 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Yooga - Suporte Interno - Drivers de Impressoras ELGIN
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
