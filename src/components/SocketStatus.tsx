import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export const SocketStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSocketStatus = async () => {
      try {
        const response = await fetch('https://socket-prod.yooga.com.br/');
        const data = await response.json();
        
        setIsOnline(data.message === "Socket server is up!");
      } catch (error) {
        console.error('Erro ao verificar status do socket:', error);
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    };

    checkSocketStatus();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkSocketStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <div
      className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ease-in-out cursor-pointer
        ${isOnline
          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
          : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
        }
        hover:scale-105 hover:shadow-xl
      `}
    >
      {isOnline ? (
        <>
          <Wifi className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">Socket ON</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">Socket OFF</span>
        </>
      )}
    </div>
  );
};