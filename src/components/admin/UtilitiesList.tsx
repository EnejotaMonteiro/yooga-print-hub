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
import { Edit, Trash2, ExternalLink, Loader2 } from "lucide-react";
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
import { UtilityFormDialog } from "./UtilityFormDialog";
import { Utility } from "@/data/utilities"; // Importar a interface Utility

export const UtilitiesList = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: utilities, isLoading } = useQuery<Utility[]>({
    queryKey: ["admin-utilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("utilitarios")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data;
    },
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
      queryClient.invalidateQueries({ queryKey: ["admin-utilities"] });
      queryClient.invalidateQueries({ queryKey: ["utilities"] }); // Invalidar cache da página pública
      toast.success("Utilitário excluído", {
        description: "O utilitário foi removido com sucesso",
      });
      setDeleteDialogOpen(false);
      setSelectedUtility(null);
    },
    onError: (error: any) => {
      console.error("Erro ao excluir utilitário:", error);
      toast.error("Erro ao excluir", {
        description: error.message || "Ocorreu um erro ao excluir o utilitário",
      });
    },
  });

  const openDeleteDialog = (utility: Utility) => {
    setSelectedUtility(utility);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (utility: Utility) => {
    setSelectedUtility(utility);
    setEditDialogOpen(true);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-utilities"] });
    queryClient.invalidateQueries({ queryKey: ["utilities"] });
    setEditDialogOpen(false);
    setSelectedUtility(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!utilities || utilities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum utilitário cadastrado ainda
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
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {utilities.map((utility) => (
              <TableRow key={utility.id}>
                <TableCell className="font-medium">{utility.ordem}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {utility.name}
                    <a
                      href={utility.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                      title="Abrir link de download"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {utility.description}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(utility)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(utility)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending && selectedUtility?.id === utility.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o utilitário "{selectedUtility?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUtility && deleteMutation.mutate(selectedUtility.id)}
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

      <UtilityFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        utility={selectedUtility}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};