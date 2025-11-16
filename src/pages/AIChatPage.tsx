import { Bot } from "lucide-react";
import { AIChat } from "@/components/FAQ/AIChat";

const AIChatPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Bot className="h-7 w-7 text-primary" />
        Assistente Virtual
      </h1>

      <div className="max-w-3xl mx-auto">
        <AIChat />
      </div>
    </div>
  );
};

export default AIChatPage;