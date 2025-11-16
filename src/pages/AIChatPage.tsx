import { Bot } from "lucide-react";
import { AIChat } from "@/components/FAQ/AIChat";

const AIChatPage = () => {
  return (
    <div className="container mx-auto px-4 md:pl-8 pt-8 flex flex-col flex-1 h-full">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Bot className="h-7 w-7 text-primary" />
        Assistente Virtual
      </h1>

      <div className="flex-1"> {/* Removido pb-8 */}
        <AIChat />
      </div>
    </div>
  );
};

export default AIChatPage;