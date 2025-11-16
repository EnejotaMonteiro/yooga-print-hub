import { Bot } from "lucide-react";
import { AIChat } from "@/components/FAQ/AIChat";

const AIChatPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:pl-8 flex flex-col flex-1"> {/* Adicionado flex flex-col flex-1 */}
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Bot className="h-7 w-7 text-primary" />
        Assistente Virtual
      </h1>

      <div className="flex-1"> {/* Removido max-w-3xl mx-auto e adicionado flex-1 */}
        <AIChat />
      </div>
    </div>
  );
};

export default AIChatPage;