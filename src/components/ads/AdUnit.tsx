import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  /** Ad slot ID from Google AdSense */
  slot?: string;
  /** Ad format - auto, horizontal, vertical, or rectangle */
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  /** Enable full-width responsive behavior */
  fullWidthResponsive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable Google AdSense ad unit component.
 * Place this component wherever you want to display an ad.
 */
export function AdUnit({
  slot = "4386922121",
  format = "auto",
  fullWidthResponsive = true,
  className,
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (isInitialized.current) return;

    try {
      // Push ad request to AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isInitialized.current = true;
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div
      className={cn(
        "ad-container w-full overflow-hidden",
        "min-h-[100px]", // Minimum height to prevent layout shift
        className
      )}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2313876589949643"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
