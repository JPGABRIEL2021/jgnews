import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdBanner = ({
  slot = "",
  format = "auto",
  responsive = true,
  className = ""
}: AdBannerProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (isAdLoaded.current) return;

    try {
      if (typeof window !== "undefined" && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdLoaded.current = true;
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`ad-container overflow-hidden flex flex-col items-center ${className}`}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1 select-none">Publicidade</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8273105614132001"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdBanner;
