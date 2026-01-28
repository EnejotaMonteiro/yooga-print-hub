import React, { createContext, useContext, useState, useEffect } from "react";

type AppMode = "normal" | "fiscal";

interface AppModeContextType {
  mode: AppMode;
  toggleMode: () => void;
  isFiscalMode: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem("app-mode");
    return (saved === "fiscal" ? "fiscal" : "normal") as AppMode;
  });

  useEffect(() => {
    localStorage.setItem("app-mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "normal" ? "fiscal" : "normal"));
  };

  const isFiscalMode = mode === "fiscal";

  return (
    <AppModeContext.Provider value={{ mode, toggleMode, isFiscalMode }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error("useAppMode must be used within an AppModeProvider");
  }
  return context;
};
