import { Scale, Plus, GripVertical, Loader2, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
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
import { useHiddenInfo } from "@/contexts/HiddenInfoContext";
import { ScaleUtilityCard, ScaleUtility } from "@/components/ScaleUtilityCard";
import { ScaleUtilityFormDialog } from "@/components/admin/ScaleUtilityFormDialog";
import { ScalePageContentEditorDialog } from "@/components/admin/ScalePageContentEditorDialog"; // Importar o novo diálogo
import ReactMarkdown from "react-markdown"; // Importar ReactMarkdown
import remarkGfm from "remark-gfm"; // Importar remarkGfm

const ScalesPage = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<ScaleUtility | null>(null);
  const [isDragModeActive, setIsDragModeActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [utilityToDelete, setUtilityToDelete] = useState<ScaleUtility | null>(null);
  const [pageContentEditorOpen, setPageContentEditorOpen] = useState(false); // Estado para o editor de conteúdo da página

  const { openPasswordDialog, showHiddenInfoGlobally } = useHiddenInfo();
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Query para o conteúdo principal da página de Balanças
  const { data: pageConfig, isLoading: isLoadingPageContent } = useQuery({
    queryKey: ["site-config-scales-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracao_site')
        .select('scales_page_content')
        .single();

      if (error && error.code === 'PGRST116') {
        return { scales_page_content: null }; // Retorna null se não houver configuração
      } else if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: utilities, isLoading } = useQuery<ScaleUtility[]>({
    queryKey: ["scale-utilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("balancas_utilitarios")
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
        .from("balancas_utilitarios")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scale-utilities"] });
      toast.success("Balança excluída", {
        description: "A balança foi removida com sucesso",
      });
      setDeleteDialogOpen(false);
      setUtilityToDelete(null);
    },
    onError: (error: any) => {
      console.error("Erro ao excluir balança:", error);
      toast.error("Erro ao excluir", {
        description: error.message || "Ocorreu um erro ao excluir a balança",
      });
    },
  });

  const handleEdit = (utility: ScaleUtility) => {
    setSelectedUtility(utility);
    setEditDialogOpen(true);
  };

  const handleDelete = (utility: ScaleUtility) => {
    setUtilityToDelete(utility);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (utilityToDelete) {
      deleteMutation.mutate(utilityToDelete.id);
    }
  };

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["scale-utilities"] });
    setAddDialogOpen(false);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["scale-utilities"] });
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

    queryClient.setQueryData(["scale-utilities"], reorderedUtilities);

    try {
      for (let i = 0; i < reorderedUtilities.length; i++) {
        const utility = reorderedUtilities[i];
        const { error } = await supabase
          .from('balancas_utilitarios')
          .update({ ordem: i })
          .eq('id', utility.id);

        if (error) throw error;
      }

      toast.success("Ordem atualizada", {
        description: "A ordem das balanças foi salva com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["scale-utilities"] });
    } catch (error: any) {
      console.error('Erro ao reordenar balanças:', error);
      toast.error("Erro ao reordenar", {
        description: error.message || "Ocorreu um erro ao reordenar as balanças",
      });
      queryClient.invalidateQueries({ queryKey: ["scale-utilities"] });
    }
  };

  const handleTitleClick = () => {
    clickCountRef.current += 1;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      if (clickCountRef.current === 3) {
        openPasswordDialog();
      }
      clickCountRef.current = 0;
    }, 300);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <div className="flex justify-between items-center mb-8">
        <h1
          className="text-3xl font-bold text-foreground flex items-center gap-3 cursor-pointer select-none"
          onClick={handleTitleClick}
        >
          <Scale className="h-7 w-7 text-primary" />
          Balanças
        </h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageContentEditorOpen(true)} // Botão para editar o conteúdo da página
              title="Editar conteúdo da página"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
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
              Adicionar Balança
            </Button>
          )}
        </div>
      </div>

      {/* Área de Conteúdo Principal da Página de Balanças */}
      <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border shadow-elegant">
        <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
          {isLoadingPageContent ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground text-sm mt-2">Carregando conteúdo...</p>
            </div>
          ) : pageConfig?.scales_page_content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {pageConfig.scales_page_content}
            </ReactMarkdown>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {isAdmin ? (
                <p>Nenhum conteúdo para a página de Balanças. Clique no ícone de lápis para adicionar.</p>
              ) : (
                <p>Nenhum conteúdo disponível para esta página.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {(isLoading || adminLoading) ? (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando balanças...</p>
        </div>
      ) : utilities && utilities.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="scale-utilities-list">
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
                      <ScaleUtilityCard
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
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma balança cadastrada ainda.
        </div>
      )}

      <ScaleUtilityFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
        utility={null}
      />

      <ScaleUtilityFormDialog
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
              Tem certeza que deseja excluir a balança "
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

      <ScalePageContentEditorDialog
        open={pageContentEditorOpen}
        onOpenChange={setPageContentEditorOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["site-config-scales-content"] })}
      />
    </div>
  );
};

export default ScalesPage;