import { useState } from "react";
import { Book } from "lucide-react"; // Usando o ícone Book para a Wiki
import { Button } from "@/components/ui/button";

interface WikiFloatingButtonProps {
  wikiUrl: string;
}

export const WikiFloatingButton = ({ wikiUrl }: WikiFloatingButtonProps) => {
  return (
    <a 
      href={wikiUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="relative z-10 group-hover:z-20 h-12 w-12 rounded-full shadow-2xl bg-gradient-primary flex items-center transition-all duration-500 ease-in-out hover:scale-105
                 "
    >
      {/* Icon container to ensure it's a circle and icon is centered */}
      <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
        <Book className="w-6 h-6 text-white" />
      </div>
      <span className="opacity-0 w-0 overflow-hidden whitespace-nowrap group-hover:opacity-100 group-hover:w-auto 
                     text-lg font-semibold text-white pr-3 transition-all duration-500 ease-in-out">
        Wiki de Suporte
      </span>
    </a>
  );
};