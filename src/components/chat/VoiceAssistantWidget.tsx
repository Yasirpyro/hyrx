import { useState, useCallback, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  Volume2, 
  VolumeX,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { VoiceOrbModal } from "./VoiceOrbModal";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFooterCollision } from "@/hooks/use-footer-collision";
import { useSpeech } from "@/hooks/use-speech";
import { streamChat, type ChatMessage as StreamMessage } from "@/lib/stream-chat";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm the HYRX Assistant. I can help you understand our AI services, find the right solution for your needs, or get started with a quote. What can I help you with today?",
};

export const VoiceAssistantWidget = memo(function VoiceAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [isCtaDismissed, setIsCtaDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("hyrx_voice_cta_dismissed") === "1";
    } catch {
      return false;
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { liftAmount, buttonRef } = useFooterCollision();

  // Use the speech hook with queue support
  const { speak, stopSpeaking, isTTSSupported, isSupported: isVoiceSupported } = useSpeech();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    // Stop any ongoing speech when user sends a new message
    if (voiceEnabled) {
      stopSpeaking();
    }

    // Build chat history for API (exclude welcome message)
    const chatHistory: StreamMessage[] = [...messages.filter(m => m.id !== "welcome"), userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Accumulator for streaming response
    let assistantContent = "";
    const assistantId = `assistant-${Date.now()}`;

    try {
      await streamChat({
        messages: chatHistory,
        onDelta: (delta) => {
          assistantContent += delta;
          // Update or create assistant message progressively
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.id === assistantId) {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: assistantContent } : m
              );
            }
            return [...prev, { id: assistantId, role: "assistant", content: assistantContent }];
          });
        },
        onSentence: (sentence) => {
          // Speak complete sentences for natural TTS (add to queue, don't interrupt)
          if (voiceEnabled && isTTSSupported) {
            speak(sentence, false);
          }
        },
        onDone: () => {
          setIsLoading(false);
        },
        onError: (err) => {
          console.error("Chat error:", err);
          setError(err.message || "Something went wrong. Please try again.");
          
          // Add fallback message
          const fallbackMessage: Message = {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            content: "I'm having trouble connecting right now. You can reach us directly at contact@hyrx.tech or visit our Contact page.",
          };
          setMessages(prev => [...prev, fallbackMessage]);
          setIsLoading(false);
        },
      });
    } catch (err) {
      // Error already handled in onError callback
      setIsLoading(false);
    }
  }, [messages, isLoading, voiceEnabled, isTTSSupported, speak, stopSpeaking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const toggleVoice = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setVoiceEnabled(prev => !prev);
  };

  const handleMicClick = () => {
    setVoiceModalOpen(true);
  };

  const handleVoiceResult = useCallback((transcript: string) => {
    sendMessage(transcript);
  }, [sendMessage]);

  const handleVoiceError = useCallback((error: string) => {
    console.error("Voice error:", error);
    setError("Voice input not available. Please type your message.");
    setTimeout(() => setError(null), 3000);
  }, []);

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
        transition: { duration: 0.2 },
      };

  return (
    <>
      {/* Voice Orb Modal */}
      <VoiceOrbModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onResult={handleVoiceResult}
        onError={handleVoiceError}
      />

      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && !isCtaDismissed && (
          <motion.div
            ref={buttonRef}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed right-6 z-50"
            style={{
              bottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
              transform: liftAmount > 0 ? `translateY(-${liftAmount}px)` : undefined,
              transition: prefersReducedMotion ? "none" : "transform 0.2s ease-out",
            }}
          >
            <div className="relative">
              <ShinyButton onClick={() => setIsOpen(true)} aria-label="Talk to HYRX">
                <MessageCircle className="w-5 h-5" />
                Talk to HYRX
              </ShinyButton>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full border border-border/50 bg-background/90 backdrop-blur"
                aria-label="Hide Talk to HYRX"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCtaDismissed(true);
                  try {
                    sessionStorage.setItem("hyrx_voice_cta_dismissed", "1");
                  } catch {
                    // ignore
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...motionProps}
            className={cn(
              "fixed z-50 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl flex flex-col",
              isMobile
                ? "inset-x-0 bottom-0 h-[85vh] rounded-t-2xl"
                : "bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] rounded-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">HYRX Assistant</h3>
                  <p className="text-xs text-muted-foreground">AI Services Expert</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isTTSSupported && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleVoice}
                    title={voiceEnabled ? "Disable voice responses" : "Enable voice responses"}
                  >
                    {voiceEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                    <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-2.5">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-border/30">
              <QuickActions onClose={() => setIsOpen(false)} />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2 bg-destructive/10 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            {/* Input */}
            <form
              id="chat-form"
              onSubmit={handleSubmit}
              className="p-4 border-t border-border/50"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-10 bg-muted/30 border-border/50"
                    disabled={isLoading}
                  />
                  {isVoiceSupported && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={handleMicClick}
                      disabled={isLoading}
                      title="Voice input"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || isLoading}
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Footer Disclaimer */}
            <div className="px-4 py-2 border-t border-border/30 bg-muted/20">
              <p className="text-[10px] text-muted-foreground text-center">
                This assistant provides general info. For a quote, submit the form.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
