import { Download, Wrench, Pencil, Loader2, Plus, GripVertical, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { UtilityFormDialog } from "@/components/admin/UtilityFormDialog";
import { useState, useRef } from "react"; // Importar useRef
import { Utility } from "@/data/utilities";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { UtilityCard } from "@/components/UtilityCard";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useHiddenInfo } from "@/contexts/HiddenInfoContext"; // Importar o hook do contexto

const UtilitiesPage = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [isDragModeActive, setIsDragModeActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [utilityToDelete, setUtilityToDelete] = useState<Utility | null>(null);

  const { openPasswordDialog, showHiddenInfoGlobally } = useHiddenInfo(); // Usar o contexto
  const clickCountRef = useRef(0); // Ref para contar cliques no título
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref para o timeout do clique

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
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("utilitarios")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilities"] });
      toast.success("Utilitário excluído", {
        description: "O utilitário foi removido com sucesso",
      });
      setDeleteDialogOpen(false);
      setUtilityToDelete(null);
    },
    onError: (error: any) => {
      console.error("Erro ao excluir utilitário:", error);
      toast.error("Erro ao excluir", {
        description: error.message || "Ocorreu um erro ao excluir o utilitário",
      });
    },
  });

  const handleEdit = (utility: Utility) => {
    setSelectedUtility(utility);
    setEditDialogOpen(true);
  };

  const handleDelete = (utility: Utility) => {
    setUtilityToDelete(utility);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (utilityToDelete) {
      deleteMutation.mutate(utilityToDelete.id);
    }
  };

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["utilities"] });
    setAddDialogOpen(false);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["utilities"] });
    setEditDialogOpen(false);
    setSelectedUtility(null);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !utilities) {
      return;
    }

    const reorderedUtilities = Array.from(utilities);
    const [removed] = reorderedUtilities.splice(result.source.index, 1);
    reorderedUtilities.splice(result.destination.index, 0, removed);

    queryClient.setQueryData(["utilities"], reorderedUtilities);

    try {
      for (let i = 0; i < reorderedUtilities.length; i++) {
        const utility = reorderedUtilities[i];
        const { error } = await supabase
          .from('utilitarios')
          .update({ ordem: i })
          .eq('id', utility.id);

        if (error) throw error;
      }

      toast.success("Ordem atualizada", {
        description: "A ordem dos utilitários foi salva com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["utilities"] });
    } catch (error: any) {
      console.error('Erro ao reordenar utilitários:', error);
      toast.error("Erro ao reordenar", {
        description: error.message || "Ocorreu um erro ao reordenar os utilitários",
      });
      queryClient.invalidateQueries({ queryKey: ["utilities"] });
    }
  };

  const handleTitleClick = () => {
    clickCountRef.current += 1;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      if (clickCountRef.current === 3) {
        openPasswordDialog(); // Abre o diálogo de senha do contexto
      }
      clickCountRef.current = 0; // Resetar a contagem após o timeout
    }, 300); // 300ms para detectar o triplo clique
  };

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <div className="flex justify-between items-center mb-8">
        <h1 
          className="text-3xl font-bold text-foreground flex items-center gap-3 select-none"
          onClick={handleTitleClick} // Adicionado o handler de clique
          tabIndex={-1} // Adicionado tabIndex para garantir que o clique seja registrado
        >
          <Wrench className="h-7 w-7 text-primary" />
          Utilitários
        </h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant={isDragModeActive ? "default" : "outline"}
              size="icon"
              onClick={() => setIsDragModeActive(prev => !prev)}
              title={isDragModeActive ? "Desativar modo de arrastar" : "Ativar modo de arrastar para reordenar"}
            >
              <GripVertical className="w-4 h-4" />
            </Button>
          )}
          {isAdmin && (
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                setSelectedUtility(null);
                setAddDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Adicionar Utilitário
            </Button>
          )}
        </div>
      </div>

      {(isLoading || adminLoading) ? (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando utilitários...</p>
        </div>
      ) : utilities && utilities.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="utilities-list">
            {(provided) => (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto printers-droppable-area"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {utilities.map((utility, index) => (
                  <Draggable
                    key={utility.id}
                    draggableId={utility.id}
                    index={index}
                    isDragDisabled={!isDragModeActive}
                  >
                    {(provided, snapshot) => (
                      <UtilityCard
                        utility={utility}
                        isAdmin={isAdmin}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDragModeActive={isDragModeActive}
                        innerRef={provided.innerRef}
                        draggableProps={provided.draggableProps}
                        dragHandleProps={isDragModeActive ? provided.dragHandleProps : null}
                        isDragging={snapshot.isDragging}
                        showHiddenInfo={showHiddenInfoGlobally} // Passar o estado global
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum utilitário cadastrado ainda.
        </div>
      )}

      <UtilityFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
        utility={null}
      />

      <UtilityFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        utility={selectedUtility}
        onSuccess={handleEditSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o utilitário "
              <strong>{utilityToDelete?.name}</strong>"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UtilitiesPage;