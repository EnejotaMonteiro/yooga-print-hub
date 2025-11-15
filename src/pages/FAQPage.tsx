import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { convertToEmbedUrl } from "@/lib/utils";
import { Lightbulb, BookOpen } from "lucide-react";
import { ObservationsBlock } from "@/components/FAQ/ObservationsBlock";

interface Tutorial {
  id: string;
  titulo: string;
  descricao: string;
  video_url: string;
  ordem: number;
}

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tutorials, isLoading } = useQuery({
    queryKey: ["tutorials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutoriais")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as Tutorial[];
    }
  });

  const filteredTutorials = tutorials?.filter(tutorial =>
    tutorial.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutorial.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-primary" />
        Dúvidas Recorrentes
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Input
            type="text"
            placeholder="Buscar tutoriais e dicas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-6 bg-card/80 backdrop-blur-sm border-border shadow-elegant transition-smooth focus:shadow-glow"
          />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredTutorials.length > 0 ? (
            <div className="grid gap-6">
              {filteredTutorials.map((tutorial) => (
                <div key={tutorial.id} className="bg-card border rounded-lg overflow-hidden shadow-sm">
                  <div className="aspect-video">
                    <iframe
                      src={convertToEmbedUrl(tutorial.video_url)}
                      title={tutorial.titulo}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{tutorial.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{tutorial.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Nenhum tutorial encontrado" : "Nenhum tutorial disponível"}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <ObservationsBlock />
        </div>
      </div>
    </div>
  );
};

export default FAQPage;