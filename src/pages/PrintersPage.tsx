import { useState, useEffect } from "react";
import { PrinterCard } from "@/components/PrinterCard";
import { SearchBar } from "@/components/SearchBar";
import { SocketStatus } from "@/components/SocketStatus";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // Usar toast do sonner
import { Download, GripVertical } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PrinterFormDialog } from "@/components/admin/PrinterFormDialog";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

const PrintersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPrinterForEdit, setSelectedPrinterForEdit] = useState<any>(null);
  const [isDragModeActive, setIsDragModeActive] = useState(false);
  const [showDownloadAllButton, setShowDownloadAllButton] = useState(true);

  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();

  const { data: printers, isLoading: loadingPrinters } = useQuery({
    queryKey: ["printers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impressoras')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setShowDownloadAllButton(true);
      } else {
        setShowDownloadAllButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleEditPrinter = (printerId: string) => {
    const printerToEdit = printers?.find(p => p.id === printerId);
    if (printerToEdit) {
      setSelectedPrinterForEdit(printerToEdit);
      setEditDialogOpen(true);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !printers) {
      return;
    }

    const reorderedPrinters = Array.from(printers);
    const [removed] = reorderedPrinters.splice(result.source.index, 1);
    reorderedPrinters.splice(result.destination.index, 0, removed);

    queryClient.setQueryData(["printers"], reorderedPrinters);

    try {
      for (let i = 0; i < reorderedPrinters.length; i++) {
        const printer = reorderedPrinters[i];
        const { error } = await supabase
          .from('impressoras')
          .update({ ordem: i })
          .eq('id', printer.id);

        if (error) throw error;
      }

      toast.success("Ordem atualizada", {
        description: "A ordem das impressoras foi salva com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["printers"] });
    } catch (error: any) {
      console.error('Erro ao reordenar impressoras:', error);
      toast.error("Erro ao reordenar", {
        description: error.message || "Ocorreu um erro ao reordenar as impressoras",
      });
      queryClient.invalidateQueries({ queryKey: ["printers"] });
    }
  };

  const filteredPrinters = printers?.filter(printer =>
    printer.nome.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Impressoras</h1>

      <div className="flex items-center justify-between mb-8">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <div className="flex items-center gap-4">
          {showDownloadAllButton && (
            <a 
              href="https://drive.google.com/drive/folders/1-pro0D_-06g22xL_1o2N5UAMCGiRAEol?usp=drive_link" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Todos</span>
              </Button>
            </a>
          )}
          <SocketStatus />
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
        </div>
      </div>

      {/* Printers Grid */}
      <div className="pb-16">
        {(loadingPrinters || adminLoading) ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando impressoras...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="printers-list">
              {(provided) => (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto printers-droppable-area"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {filteredPrinters.map((printer, index) => (
                    <Draggable 
                      key={printer.id} 
                      draggableId={printer.id} 
                      index={index} 
                      isDragDisabled={!isDragModeActive}
                    >
                      {(provided, snapshot) => (
                        <PrinterCard
                          key={printer.id}
                          id={printer.id}
                          name={printer.nome}
                          videoUrl={printer.video_url}
                          downloadUrl={printer.download_url}
                          networkConnection={printer.conexao_rede}
                          recommendedWindows={printer.windows_recomendado}
                          isAdmin={isAdmin}
                          onEdit={handleEditPrinter}
                          innerRef={provided.innerRef}
                          draggableProps={provided.draggableProps}
                          dragHandleProps={isDragModeActive ? provided.dragHandleProps : {}} // Sempre passa um objeto
                          isDragModeActive={isDragModeActive}
                          isDragging={snapshot.isDragging}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {filteredPrinters.length === 0 && searchTerm && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">Nenhuma impressora encontrada para "{searchTerm}"</p>
                    </div>
                  )}
                  {printers?.length === 0 && !loadingPrinters && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">Nenhuma impressora cadastrada ainda.</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Printer Edit Dialog */}
      <PrinterFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        printer={selectedPrinterForEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["printers"] });
          setEditDialogOpen(false);
          setSelectedPrinterForEdit(null);
        }}
      />
    </div>
  );
};

export default PrintersPage;