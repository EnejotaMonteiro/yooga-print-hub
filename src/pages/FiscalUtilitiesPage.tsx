import { Download, FileText, Loader2, Plus, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { FiscalUtilityFormDialog, FiscalUtility } from "@/components/admin/FiscalUtilityFormDialog";
import { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { UtilityCard } from "@/components/UtilityCard";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useHiddenInfo } from "@/contexts/HiddenInfoContext";

const FiscalUtilitiesPage = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<FiscalUtility | null>(null);
  const [isDragModeActive, setIsDragModeActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [utilityToDelete, setUtilityToDelete] = useState<FiscalUtility | null>(null);
  const { openPasswordDialog, showHiddenInfoGlobally } = useHiddenInfo();
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: utilities, isLoading } = useQuery<FiscalUtility[]>({
    queryKey: ["fiscal-utilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("utilitarios_fiscais")
        .select("*")
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("utilitarios_fiscais").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-utilities"] });
      toast.success("Utilitário fiscal excluído");
      setDeleteDialogOpen(false);
      setUtilityToDelete(null);
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir", { description: error.message });
    },
  });

  const handleEdit = (utility: FiscalUtility) => { setSelectedUtility(utility); setEditDialogOpen(true); };
  const handleDelete = (utility: FiscalUtility) => { setUtilityToDelete(utility); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (utilityToDelete) deleteMutation.mutate(utilityToDelete.id); };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !utilities) return;
    const reordered = Array.from(utilities);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    queryClient.setQueryData(["fiscal-utilities"], reordered);
    try {
      for (let i = 0; i < reordered.length; i++) {
        const { error } = await supabase.from('utilitarios_fiscais').update({ ordem: i }).eq('id', reordered[i].id);
        if (error) throw error;
      }
      toast.success("Ordem atualizada");
      queryClient.invalidateQueries({ queryKey: ["fiscal-utilities"] });
    } catch (error: any) {
      toast.error("Erro ao reordenar", { description: error.message });
      queryClient.invalidateQueries({ queryKey: ["fiscal-utilities"] });
    }
  };

  const handleTitleClick = () => {
    clickCountRef.current += 1;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      if (clickCountRef.current === 3) openPasswordDialog();
      clickCountRef.current = 0;
    }, 300);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 cursor-pointer select-none" onClick={handleTitleClick}>
          <FileText className="h-7 w-7 text-primary" />
          Utilitários Fiscais
        </h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant={isDragModeActive ? "default" : "outline"} size="icon" onClick={() => setIsDragModeActive(prev => !prev)} title="Modo arrastar">
              <GripVertical className="w-4 h-4" />
            </Button>
          )}
          {isAdmin && (
            <Button className="flex items-center gap-2" onClick={() => { setSelectedUtility(null); setAddDialogOpen(true); }}>
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          )}
        </div>
      </div>

      {(isLoading || adminLoading) ? (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : utilities && utilities.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="fiscal-utilities-list">
            {(provided) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" {...provided.droppableProps} ref={provided.innerRef}>
                {utilities.map((utility, index) => (
                  <Draggable key={utility.id} draggableId={utility.id} index={index} isDragDisabled={!isDragModeActive}>
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
                        showHiddenInfo={showHiddenInfoGlobally}
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
        <div className="text-center py-8 text-muted-foreground">Nenhum utilitário fiscal cadastrado ainda.</div>
      )}

      <FiscalUtilityFormDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={() => { queryClient.invalidateQueries({ queryKey: ["fiscal-utilities"] }); setAddDialogOpen(false); }} utility={null} />
      <FiscalUtilityFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} utility={selectedUtility} onSuccess={() => { queryClient.invalidateQueries({ queryKey: ["fiscal-utilities"] }); setEditDialogOpen(false); setSelectedUtility(null); }} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir "<strong>{utilityToDelete?.name}</strong>"?</AlertDialogDescription>
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

export default FiscalUtilitiesPage;
