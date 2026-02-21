import { ReactNode, lazy, Suspense } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { useTheme } from "@/components/providers/ThemeProvider";

// Lazy load the voice assistant widget
const VoiceAssistantWidget = lazy(() =>
  import("@/components/chat/VoiceAssistantWidget").then((mod) => ({
    default: mod.VoiceAssistantWidget,
  }))
);

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Background effects — only visible in dark mode */}
      {theme === "dark" && (
        <>
          <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        </>
      )}
      
      <SiteHeader />
      <main className="flex-1 relative pb-[72px]">{children}</main>
      <SiteFooter />
      
      {/* Voice Assistant Widget - Lazy loaded */}
      <Suspense fallback={null}>
        <VoiceAssistantWidget />
      </Suspense>
    </div>
  );
}
