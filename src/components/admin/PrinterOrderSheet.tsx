import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GripVertical, Save, Loader2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Printer } from "@/pages/PrintersPage"; // Reutilizar a interface Printer
import { cn } from "@/lib/utils";

interface PrinterOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printers: Printer[];
  onOrderChange: (result: DropResult | null, reorderedList?: Printer[]) => Promise<void>; // Recebe a função de reordenação
  isLoading: boolean;
}

export const PrinterOrderSheet = ({
  open,
  onOpenChange,
  printers,
  onOrderChange,
  isLoading,
}: PrinterOrderSheetProps) => {
  const [localPrinters, setLocalPrinters] = useState<Printer[]>(printers);
  const [isSaving, setIsSaving] = useState(false);

  // Atualiza a lista local quando as props de impressoras mudam (ex: após um save)
  useEffect(() => {
    setLocalPrinters(printers);
  }, [printers]); // Dependência na prop 'printers'

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedPrinters = Array.from(localPrinters);
    const [removed] = reorderedPrinters.splice(result.source.index, 1);
    reorderedPrinters.splice(result.destination.index, 0, removed);

    setLocalPrinters(reorderedPrinters);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      // Chama a função onOrderChange da página principal, passando a lista reordenada
      await onOrderChange(null, localPrinters); 
      onOpenChange(false); // Fecha o painel após salvar
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Reordenar Impressoras</SheetTitle>
          <SheetDescription>
            Arraste e solte os itens para mudar a ordem de exibição das impressoras.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="printer-order-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {localPrinters.length > 0 ? ( // Verifica se há impressoras para exibir
                      localPrinters.map((printer, index) => (
                        <Draggable key={printer.id} draggableId={printer.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "flex items-center gap-3 p-3 border rounded-md bg-card text-foreground",
                                snapshot.isDragging && "bg-primary/10 border-primary shadow-md"
                              )}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab text-muted-foreground hover:text-foreground"
                                title="Arrastar para reordenar"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <span className="flex-1 font-medium">{printer.nome}</span>
                              <span className="text-sm text-muted-foreground">{index + 1}</span>
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma impressora cadastrada.
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        <div className="mt-auto flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSaveOrder} disabled={isSaving || isLoading}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Ordem
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};