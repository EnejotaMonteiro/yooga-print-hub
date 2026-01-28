import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppModeToggle() {
  const { isFiscalMode, toggleMode } = useAppMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMode}
          className="text-white hover:bg-white/20"
        >
          {isFiscalMode ? (
            <Printer className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <FileText className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Alternar modo</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{isFiscalMode ? "Modo Impressoras" : "Modo Fiscal"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
