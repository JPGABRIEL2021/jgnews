import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MarketData {
  name: string;
  symbol: string;
  value: string;
  change: number;
  formatted: string;
}

const MarketTicker = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { name: "Dólar", symbol: "USD", value: "0", change: 0, formatted: "R$ --" },
    { name: "Euro", symbol: "EUR", value: "0", change: 0, formatted: "R$ --" },
    { name: "Bitcoin", symbol: "BTC", value: "0", change: 0, formatted: "R$ --" },
    { name: "Ethereum", symbol: "ETH", value: "0", change: 0, formatted: "R$ --" },
  ]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-market-quotes');
      
      if (error) throw error;
      
      if (data?.quotes) {
        setMarketData(data.quotes);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching market quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchQuotes, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  return (
    <div className="bg-muted/50 border-b border-border overflow-hidden">
      <div className="container py-2">
        <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0 hidden sm:flex">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Mercado
            </span>
            {loading && (
              <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />
            )}
          </div>
          
          {/* Desktop: static display */}
          <div className="hidden md:flex items-center gap-6">
            {marketData.map((item) => (
              <div key={item.symbol} className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <span className="text-sm text-foreground">{item.formatted}</span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${getChangeColor(item.change)}`}>
                  {getChangeIcon(item.change)}
                  {item.change > 0 ? "+" : ""}{item.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* Mobile: marquee animation */}
          <div className="md:hidden flex animate-marquee">
            {/* Duplicate content for seamless loop */}
            {[...marketData, ...marketData].map((item, index) => (
              <div key={`${item.symbol}-${index}`} className="flex items-center gap-1.5 shrink-0 mr-6">
                <span className="text-xs font-medium text-foreground">{item.name}</span>
                <span className="text-xs text-foreground">{item.formatted}</span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${getChangeColor(item.change)}`}>
                  {getChangeIcon(item.change)}
                  {item.change > 0 ? "+" : ""}{item.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
