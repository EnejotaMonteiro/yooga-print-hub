import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit, Trash2, Loader2, GripVertical } from "lucide-react";
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
import { ScaleProcessFormDialog, ScaleProcess } from "./ScaleProcessFormDialog";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";

export const ScaleProcessList = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ScaleProcess | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [localProcesses, setLocalProcesses] = useState<ScaleProcess[]>([]);

  const { data: processes, isLoading } = useQuery<ScaleProcess[]>({
    queryKey: ["scale-processes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scale_processes")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      setLocalProcesses(data); // Inicializa a lista local com os dados do banco
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scale_processes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scale-processes"] });
      toast.success("Processo excluído", {
        description: "O processo foi removido com sucesso",
      });
      setDeleteDialogOpen(false);
      setSelectedProcess(null);
    },
    onError: (error: any) => {
      console.error("Erro ao excluir processo:", error);
      toast.error("Erro ao excluir", {
        description: error.message || "Ocorreu um erro ao excluir o processo",
      });
    },
  });

  const handleEdit = (process: ScaleProcess) => {
    setSelectedProcess(process);
    setEditDialogOpen(true);
  };

  const handleDelete = (process: ScaleProcess) => {
    setSelectedProcess(process);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProcess) {
      deleteMutation.mutate(selectedProcess.id);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["scale-processes"] });
    setEditDialogOpen(false);
    setSelectedProcess(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedProcesses = Array.from(localProcesses);
    const [removed] = reorderedProcesses.splice(result.source.index, 1);
    reorderedProcesses.splice(result.destination.index, 0, removed);

    setLocalProcesses(reorderedProcesses);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      for (let i = 0; i < localProcesses.length; i++) {
        const process = localProcesses[i];
        const { error } = await supabase
          .from('scale_processes')
          .update({ ordem: i })
          .eq('id', process.id);

        if (error) throw error;
      }
      toast.success("Ordem salva", { description: "A ordem dos processos foi atualizada." });
      queryClient.invalidateQueries({ queryKey: ["scale-processes"] });
    } catch (error: any) {
      console.error("Erro ao salvar ordem:", error);
      toast.error("Erro ao salvar ordem", { description: error.message || "Não foi possível salvar a nova ordem." });
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!processes || processes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum processo de balança cadastrado ainda.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ordem</TableHead>
              <TableHead>Botão</TableHead>
              <TableHead>Título do Processo</TableHead>
              <TableHead className="text-right w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="scale-processes-list">
              {(provided) => (
                <TableBody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {localProcesses.map((process, index) => (
                    <Draggable key={process.id} draggableId={process.id} index={index}>
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            snapshot.isDragging && "bg-primary/10 border-primary shadow-md"
                          )}
                        >
                          <TableCell className="font-medium">
                            <div {...provided.dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground">
                              <GripVertical className="h-5 w-5" /> {index + 1}
                            </div>
                          </TableCell>
                          <TableCell>{process.button_text}</TableCell>
                          <TableCell>{process.title}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(process)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(process)}
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending && selectedProcess?.id === process.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={handleSaveOrder} disabled={isSavingOrder || isLoading}>
          {isSavingOrder ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Ordem dos Processos
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o processo "
              <strong>{selectedProcess?.title}</strong>"? Esta ação não pode ser desfeita.
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ScaleProcessFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        process={selectedProcess}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};