import { useState } from "react";
import { Book } from "lucide-react"; // Usando o ícone Book para a Wiki
import { Button } from "@/components/ui/button";

interface WikiFloatingButtonProps {
  wikiUrl: string;
}

export const WikiFloatingButton = ({ wikiUrl }: WikiFloatingButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a 
        href={wikiUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group h-14 rounded-full shadow-2xl bg-gradient-primary flex items-center transition-all hover:scale-105
                   px-0" // Remove default horizontal padding
      >
        {/* Icon container to ensure it's a circle */}
        <div className="h-14 w-14 flex items-center justify-center flex-shrink-0">
          <Book className="w-6 h-6 text-white" />
        </div>
        <span className="hidden group-hover:inline-block text-lg font-semibold text-white pr-6 transition-all duration-300"> {/* pr-6 for right padding */}
          Wiki de Suporte
        </span>
      </a>
    </div>
  );
};