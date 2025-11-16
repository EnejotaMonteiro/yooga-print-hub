import { AIChat } from "@/components/FAQ/AIChat";

const AIChatPage = () => {
  return (
    <div className="container mx-auto px-4 md:pl-8 flex flex-col h-full py-8"> {/* Adicionado h-full e py-8 */}
      {/* O título 'Assistente Virtual' foi movido para dentro do componente AIChat */}
      <AIChat />
    </div>
  );
};

export default AIChatPage;