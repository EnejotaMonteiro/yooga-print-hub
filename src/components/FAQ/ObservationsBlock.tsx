import { AlertTriangle, Lightbulb, Eye } from "lucide-react";

export const ObservationsBlock = () => {
  const observations = [
    {
      type: "tip",
      icon: <Lightbulb className="h-5 w-5 text-accent" />,
      title: "Dica Importante",
      content: "Sempre reinicie o serviço de spooler após instalar novos drivers para garantir o funcionamento correto."
    },
    {
      type: "discovery",
      icon: <Eye className="h-5 w-5 text-primary" />,
      title: "Descoberta",
      content: "Impressoras Elgin funcionam melhor com drivers específicos da marca, evite drivers genéricos."
    },
    {
      type: "alert",
      icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
      title: "Alerta",
      content: "Antes de desinstalar drivers, certifique-se de ter o arquivo de instalação correto disponível."
    }
  ];

  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border rounded-lg shadow-elegant p-6">
      <h3 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-accent" />
        Observações Gerais
      </h3>
      
      <div className="space-y-4">
        {observations.map((obs, index) => (
          <div key={index} className="flex gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex-shrink-0 mt-0.5">
              {obs.icon}
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">{obs.title}</h4>
              <p className="text-sm text-muted-foreground">{obs.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};