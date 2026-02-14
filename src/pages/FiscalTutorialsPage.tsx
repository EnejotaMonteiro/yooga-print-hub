import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { convertToEmbedUrl } from "@/lib/utils";
import { GraduationCap, Pencil, Plus } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { FiscalTutorialFormDialog, FiscalTutorial } from "@/components/admin/FiscalTutorialFormDialog";

const FiscalTutorialsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTutorial, setEditingTutorial] = useState<FiscalTutorial | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();

  const { data: tutorials, isLoading } = useQuery({
    queryKey: ["fiscal-tutorials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutoriais_fiscais")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data as FiscalTutorial[];
    },
  });

  const filteredTutorials = tutorials?.filter(t =>
    t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (tutorial: FiscalTutorial) => { setEditingTutorial(tutorial); setDialogOpen(true); };
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["fiscal-tutorials"] });
    setEditingTutorial(null);
    setDialogOpen(false);
    setAddDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <GraduationCap className="h-7 w-7 text-primary" />
          Tutoriais Fiscais
        </h1>
        {isAdmin && (
          <Button className="flex items-center gap-2" onClick={() => { setEditingTutorial(null); setAddDialogOpen(true); }}>
            <Plus className="w-4 h-4" /> Adicionar Tutorial
          </Button>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <Input
          type="text"
          placeholder="Buscar tutoriais fiscais..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-6 bg-card/80 backdrop-blur-sm border-border shadow-elegant transition-smooth focus:shadow-glow"
        />

        {(isLoading || adminLoading) ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredTutorials.length > 0 ? (
          <div className="grid gap-6">
            {filteredTutorials.map((tutorial) => (
              <div key={tutorial.id} className="bg-card border rounded-lg overflow-hidden shadow-sm relative">
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(tutorial)} className="absolute top-2 right-2 bg-background/80 hover:bg-background z-10" title="Editar tutorial">
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
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
            {searchTerm ? "Nenhum tutorial encontrado" : "Nenhum tutorial fiscal disponível"}
          </div>
        )}
      </div>

      <FiscalTutorialFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingTutorial(null); }}
        tutorial={editingTutorial}
        onSuccess={handleSuccess}
      />
      <FiscalTutorialFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        tutorial={null}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default FiscalTutorialsPage;
