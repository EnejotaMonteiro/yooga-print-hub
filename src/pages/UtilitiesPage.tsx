import { Download, Wrench, Pencil, Loader2, Plus } from "lucide-react"; // Adicionado Plus
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { UtilityFormDialog } from "@/components/admin/UtilityFormDialog";
import { useState } from "react";
import { Utility } from "@/data/utilities";

const UtilitiesPage = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false); // Novo estado para o dialog de adicionar
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);

  const { data: utilities, isLoading } = useQuery<Utility[]>({
    queryKey: ["utilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("utilitarios")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (utility: Utility) => {
    setSelectedUtility(utility);
    setEditDialogOpen(true);
  };

  const handleAddSuccess = () => { // Handler para sucesso ao adicionar
    queryClient.invalidateQueries({ queryKey: ["utilities"] });
    setAddDialogOpen(false);
  };

  const handleEditSuccess = () => { // Handler para sucesso ao editar
    queryClient.invalidateQueries({ queryKey: ["utilities"] });
    setEditDialogOpen(false);
    setSelectedUtility(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Wrench className="h-7 w-7 text-primary" />
          Utilitários
        </h1>
        {isAdmin && (
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedUtility(null); // Garante que o formulário esteja vazio para adicionar
              setAddDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Adicionar Utilitário
          </Button>
        )}
      </div>

      {(isLoading || adminLoading) ? (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando utilitários...</p>
        </div>
      ) : utilities && utilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {utilities.map((utility) => (
            <Card key={utility.id} className="bg-card/80 backdrop-blur-sm border-border/20 shadow-elegant relative">
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(utility)}
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background z-10"
                  title="Editar utilitário"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {utility.image_url && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img src={utility.image_url} alt={utility.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className={utility.image_url ? "pt-4" : ""}>
                <CardTitle>{utility.name}</CardTitle>
                <CardDescription>{utility.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <a href={utility.download_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum utilitário cadastrado ainda.
        </div>
      )}

      {/* Dialog para adicionar novo utilitário */}
      <UtilityFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
        utility={null} // Garante que o formulário esteja vazio para adicionar
      />

      {/* Dialog para editar utilitário existente */}
      <UtilityFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        utility={selectedUtility}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default UtilitiesPage;