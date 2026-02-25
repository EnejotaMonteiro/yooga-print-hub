import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { convertToEmbedUrl } from "@/lib/utils";
import { Lightbulb, BookOpen, Pencil, Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { ObservationsBlock } from "@/components/FAQ/ObservationsBlock";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { TutorialFormDialog } from "@/components/admin/TutorialFormDialog";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Tutorial {
  id: string;
  titulo: string;
  descricao: string;
  video_url: string;
  ordem: number;
  ativo: boolean;
}

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isDragModeActive, setIsDragModeActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tutorialToDelete, setTutorialToDelete] = useState<Tutorial | null>(null);

  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tutoriais").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
      toast.success("Tutorial excluído");
      setDeleteDialogOpen(false);
      setTutorialToDelete(null);
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir", { description: error.message });
    },
  });

  const filteredTutorials = tutorials?.filter(tutorial =>
    tutorial.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutorial.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setDialogOpen(true);
  };

  const handleDelete = (tutorial: Tutorial) => {
    setTutorialToDelete(tutorial);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tutorialToDelete) deleteMutation.mutate(tutorialToDelete.id);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["tutorials"] });
    setEditingTutorial(null);
    setDialogOpen(false);
    setAddDialogOpen(false);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !tutorials) return;
    const reordered = Array.from(tutorials);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    queryClient.setQueryData(["tutorials"], reordered);
    try {
      for (let i = 0; i < reordered.length; i++) {
        const { error } = await supabase.from('tutoriais').update({ ordem: i }).eq('id', reordered[i].id);
        if (error) throw error;
      }
      toast.success("Ordem atualizada");
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
    } catch (error: any) {
      toast.error("Erro ao reordenar", { description: error.message });
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-primary" />
          Dúvidas Recorrentes
        </h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant={isDragModeActive ? "default" : "outline"}
              size="icon"
              onClick={() => setIsDragModeActive(prev => !prev)}
              title="Modo arrastar"
            >
              <GripVertical className="w-4 h-4" />
            </Button>
          )}
          {isAdmin && (
            <Button className="flex items-center gap-2" onClick={() => { setEditingTutorial(null); setAddDialogOpen(true); }}>
              <Plus className="w-4 h-4" /> Adicionar Tutorial
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Input
            type="text"
            placeholder="Buscar tutoriais e dicas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-6 bg-card/80 backdrop-blur-sm border-border shadow-elegant transition-smooth focus:shadow-glow"
          />

          {(isLoading || adminLoading) ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredTutorials.length > 0 ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tutorials-list">
                {(provided) => (
                  <div className="grid gap-6" {...provided.droppableProps} ref={provided.innerRef}>
                    {filteredTutorials.map((tutorial, index) => (
                      <Draggable key={tutorial.id} draggableId={tutorial.id} index={index} isDragDisabled={!isDragModeActive}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-card border rounded-lg overflow-hidden shadow-sm relative ${snapshot.isDragging ? "ring-2 ring-primary shadow-lg" : ""}`}
                          >
                            {isDragModeActive && (
                              <div {...provided.dragHandleProps} className="absolute top-2 left-2 z-10 cursor-grab bg-background/80 rounded p-1">
                                <GripVertical className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            {isAdmin && (
                              <div className="absolute top-2 right-2 z-10 flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(tutorial)} className="bg-background/80 hover:bg-background" title="Editar">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(tutorial)} className="bg-background/80 hover:bg-background text-destructive" title="Excluir">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {searchTerm ? "Nenhum tutorial encontrado" : "Nenhum tutorial disponível"}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <ObservationsBlock />
        </div>
      </div>

      <TutorialFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingTutorial(null); }}
        tutorial={editingTutorial}
        onSuccess={handleSuccess}
      />
      <TutorialFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        tutorial={null}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir "<strong>{tutorialToDelete?.titulo}</strong>"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Excluindo...</> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FAQPage;
