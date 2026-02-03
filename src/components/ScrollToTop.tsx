import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getLenis } from "@/hooks/use-smooth-scroll";

/**
 * Scrolls to top on route change.
 * Works with both Lenis smooth scroll and native scrolling.
 * Place inside <BrowserRouter> to capture all navigation events.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use Lenis if available, otherwise fallback to native scroll
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}
