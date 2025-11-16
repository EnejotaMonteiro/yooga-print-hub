import React, { createContext, useState, useContext, useRef, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Unlock } from "lucide-react";

interface HiddenInfoContextType {
  showHiddenInfoGlobally: boolean;
  openPasswordDialog: () => void;
}

const HiddenInfoContext = createContext<HiddenInfoContextType | undefined>(undefined);

const CORRECT_PASSWORD = "tcmcbxkbrdsc";

export const HiddenInfoProvider = ({ children }: { children: ReactNode }) => {
  const [showHiddenInfoGlobally, setShowHiddenInfoGlobally] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");

  const openPasswordDialog = () => {
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === CORRECT_PASSWORD) {
      setShowHiddenInfoGlobally(true);
      setIsPasswordDialogOpen(false);
      setEnteredPassword("");
      toast.success("Acesso concedido!", {
        description: "As informações ocultas foram reveladas.",
      });
    } else {
      toast.error("Senha incorreta", {
        description: "Por favor, tente novamente.",
      });
      setEnteredPassword("");
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) {
      setEnteredPassword("");
      // Não resetar showHiddenInfoGlobally aqui, pois ele deve permanecer ativo até a página ser recarregada ou o usuário desativar.
    }
  };

  return (
    <HiddenInfoContext.Provider value={{ showHiddenInfoGlobally, openPasswordDialog }}>
      {children}

      <Dialog open={isPasswordDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Acesso Restrito</DialogTitle>
            <DialogDescription>
              Esta informação é protegida por senha. Por favor, insira a senha para continuar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Unlock className="w-4 h-4 mr-2" />
                Acessar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </HiddenInfoContext.Provider>
  );
};

export const useHiddenInfo = () => {
  const context = useContext(HiddenInfoContext);
  if (context === undefined) {
    throw new Error('useHiddenInfo must be used within a HiddenInfoProvider');
  }
  return context;
};