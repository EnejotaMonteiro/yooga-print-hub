"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";
import { Printer } from "lucide-react"; // Importar o ícone de impressora

export function Toaster() {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      icons={{
        info: undefined, // Remove o ícone de informação
        success: <Printer className="h-4 w-4" />, // Ícone de impressora para toasts de sucesso
        warning: <Printer className="h-4 w-4" />, // Ícone de impressora para toasts de aviso
        error: <Printer className="h-4 w-4" />, // Ícone de impressora para toasts de erro
      }}
    />
  );
}