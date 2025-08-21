import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TutorialSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const TutorialSearch = ({ searchTerm, onSearchChange }: TutorialSearchProps) => {
  return (
    <div className="relative max-w-lg mx-auto mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Buscar tutoriais e dicas..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-card/80 backdrop-blur-sm border-border shadow-elegant transition-smooth focus:shadow-glow"
      />
    </div>
  );
};