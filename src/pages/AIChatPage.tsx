import { AIChat } from "@/components/FAQ/AIChat";

const AIChatPage = () => {
  return (
    <div className="container mx-auto px-4 md:pl-8 pt-8 pb-8 flex flex-col h-full">
      {/* O título 'Assistente Virtual' foi movido para dentro do componente AIChat */}
      <div className="flex-1"> {/* Este div garante que o AIChat preencha a altura restante */}
        <AIChat />
      </div>
    </div>
  );
};

export default AIChatPage;