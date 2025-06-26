
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  connected: boolean;
}

export const ConnectionStatus = ({ connected }: ConnectionStatusProps) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
      connected 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {connected ? (
        <>
          <Wifi className="w-4 h-4" />
          Conectado
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          Offline
        </>
      )}
    </div>
  );
};
