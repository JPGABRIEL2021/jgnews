import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketData {
  name: string;
  value: string;
  change: number;
  symbol: string;
}

const MarketTicker = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { name: "Dólar", value: "R$ 6,18", change: 0.32, symbol: "USD" },
    { name: "Euro", value: "R$ 6,42", change: -0.15, symbol: "EUR" },
    { name: "Ibovespa", value: "119.450", change: 0.85, symbol: "IBOV" },
    { name: "Bitcoin", value: "$ 97.230", change: 2.14, symbol: "BTC" },
  ]);

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
          <span className="text-xs font-semibold text-muted-foreground uppercase shrink-0 hidden sm:block">
            Mercado
          </span>
          
          {/* Desktop: static display */}
          <div className="hidden md:flex items-center gap-6">
            {marketData.map((item) => (
              <div key={item.symbol} className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <span className="text-sm text-foreground">{item.value}</span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${getChangeColor(item.change)}`}>
                  {getChangeIcon(item.change)}
                  {item.change > 0 ? "+" : ""}{item.change}%
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
                <span className="text-xs text-foreground">{item.value}</span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${getChangeColor(item.change)}`}>
                  {getChangeIcon(item.change)}
                  {item.change > 0 ? "+" : ""}{item.change}%
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
