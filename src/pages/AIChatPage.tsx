import { AIChat } from "@/components/FAQ/AIChat";

const AIChatPage = () => {
  return (
    <div className="container mx-auto px-4 md:pl-8 flex flex-col flex-1 py-8"> {/* Alterado h-full para flex-1 */}
      {/* O título 'Assistente Virtual' foi movido para dentro do componente AIChat */}
      <AIChat />
    </div>
  );
};

export default AIChatPage;