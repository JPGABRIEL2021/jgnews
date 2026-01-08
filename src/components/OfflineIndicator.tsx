import { WifiOff } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

export const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium animate-fade-in">
      <WifiOff className="w-4 h-4" />
      <span>Você está offline. Mostrando notícias salvas.</span>
    </div>
  );
};
