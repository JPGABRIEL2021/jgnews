import { RefreshCw } from "lucide-react";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  progress: number;
  threshold?: number;
}

const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  progress,
  threshold = 80,
}: PullToRefreshIndicatorProps) => {
  if (pullDistance === 0 && !isRefreshing) return null;

  const translateY = Math.min(pullDistance, threshold) - 60;
  const scale = 0.5 + progress * 0.5;
  const rotation = progress * 180;

  return (
    <div
      className="fixed left-1/2 z-50 flex items-center justify-center"
      style={{
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity: Math.min(progress * 2, 1),
        transition: pullDistance === 0 ? "all 0.3s ease-out" : "none",
      }}
    >
      <div
        className="flex items-center justify-center w-10 h-10 bg-background rounded-full shadow-lg border border-border"
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <RefreshCw
          className={`w-5 h-5 text-primary ${isRefreshing ? "animate-spin" : ""}`}
          style={{
            transform: isRefreshing ? "none" : `rotate(${rotation}deg)`,
            transition: isRefreshing ? "none" : "transform 0.1s ease-out",
          }}
        />
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
