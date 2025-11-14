import { useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIChat } from "@/components/FAQ/AIChat"; // Importar o componente AIChat

export const AIChatFloatingButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 z-50"
        size="icon"
        title="Conversar com Assistente de IA"
      >
        <Bot className="w-6 h-6 text-white" />
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Assistente de Impressoras</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <AIChat />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};