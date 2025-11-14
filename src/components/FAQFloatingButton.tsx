import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { convertToEmbedUrl } from "@/lib/utils"; // Importar a função de utilidade

interface Tutorial {
  id: string;
  titulo: string;
  descricao: string;
  video_url: string;
  ordem: number;
}

export const FAQFloatingButton = () => {
  const [open, setOpen] = useState(false);
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
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 z-50"
        size="icon"
      >
        <BookOpen className="w-6 h-6 text-white" />
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Dúvidas Recorrentes / Observações</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Search Bar */}
            <Input
              type="text"
              placeholder="Buscar tutoriais e dicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />

            {/* Tutorials List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredTutorials.length > 0 ? (
              <div className="grid gap-4">
                {filteredTutorials.map((tutorial) => (
                  <div key={tutorial.id} className="bg-card border rounded-lg overflow-hidden">
                    <div className="aspect-video">
                      <iframe
                        src={convertToEmbedUrl(tutorial.video_url)} {/* Usando convertToEmbedUrl */}
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
        </DialogContent>
      </Dialog>
    </>
  );
};