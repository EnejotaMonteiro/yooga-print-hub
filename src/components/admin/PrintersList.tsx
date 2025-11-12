import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { PrinterFormDialog } from "./PrinterFormDialog";

export const PrintersList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: printers, isLoading } = useQuery({
    queryKey: ["admin-printers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("impressoras")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    if (!selectedPrinter) return;

    try {
      const { error } = await supabase
        .from("impressoras")
        .delete()
        .eq("id", selectedPrinter.id);

      if (error) throw error;

      toast({
        title: "Impressora excluída",
        description: "A impressora foi removida com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-printers"] });
      queryClient.invalidateQueries({ queryKey: ["printers"] });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Ocorreu um erro ao excluir a impressora",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPrinter(null);
    }
  };

  const openDeleteDialog = (printer: any) => {
    setSelectedPrinter(printer);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (printer: any) => {
    setSelectedPrinter(printer);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-printers"] });
    queryClient.invalidateQueries({ queryKey: ["printers"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!printers || printers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma impressora cadastrada ainda
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Windows</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rede</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {printers.map((printer) => (
              <TableRow key={printer.id}>
                <TableCell className="font-medium">{printer.ordem}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {printer.nome}
                    <a
                      href={printer.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {printer.windows_recomendado}
                </TableCell>
                <TableCell>
                  <Badge variant={printer.ativo ? "default" : "secondary"}>
                    {printer.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {printer.conexao_rede ? "Sim" : "Não"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(printer)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(printer)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
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
              Tem certeza que deseja excluir a impressora "{selectedPrinter?.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PrinterFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        printer={selectedPrinter}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};
