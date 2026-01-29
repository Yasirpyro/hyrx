import { useState, useCallback, useEffect, useRef } from "react";

interface UseSpeechOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface SpeechState {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  isTTSSupported: boolean;
}

export function useSpeech({ onResult, onError }: UseSpeechOptions = {}) {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    isSpeaking: false,
    isSupported: false,
    isTTSSupported: false,
  });

  const recognitionRef = useRef<any>(null);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const isSpeakingRef = useRef(false);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const isSupported = !!SpeechRecognitionAPI;
    const isTTSSupported = 'speechSynthesis' in window;

    setState(prev => ({ ...prev, isSupported, isTTSSupported }));

    if (isSupported) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult?.(transcript);
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'aborted') {
          onError?.(event.error);
        }
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [onResult, onError]);

  // Process the utterance queue
  const processQueue = useCallback(() => {
    if (!window.speechSynthesis || isSpeakingRef.current) return;
    
    const nextUtterance = utteranceQueueRef.current.shift();
    if (!nextUtterance) {
      setState(prev => ({ ...prev, isSpeaking: false }));
      return;
    }

    isSpeakingRef.current = true;
    setState(prev => ({ ...prev, isSpeaking: true }));

    nextUtterance.onend = () => {
      isSpeakingRef.current = false;
      // Process next item in queue
      processQueue();
    };

    nextUtterance.onerror = () => {
      isSpeakingRef.current = false;
      processQueue();
    };

    window.speechSynthesis.speak(nextUtterance);
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || state.isListening) return;

    try {
      // Stop any ongoing speech first
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      utteranceQueueRef.current = [];
      isSpeakingRef.current = false;
      setState(prev => ({ ...prev, isSpeaking: false }));

      recognitionRef.current.start();
      setState(prev => ({ ...prev, isListening: true }));
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError?.('Failed to start voice input');
    }
  }, [state.isListening, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setState(prev => ({ ...prev, isListening: false }));
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, []);

  /**
   * Speak text with optional interrupt control
   * @param text - Text to speak
   * @param shouldInterrupt - If true, cancels current speech and clears queue. 
   *                          If false, adds to queue (for streaming chunks).
   */
  const speak = useCallback((text: string, shouldInterrupt: boolean = true) => {
    if (!window.speechSynthesis || !text) return;

    // If interrupting (new user query), cancel everything
    if (shouldInterrupt) {
      window.speechSynthesis.cancel();
      utteranceQueueRef.current = [];
      isSpeakingRef.current = false;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Samantha') || 
      v.name.includes('Daniel') ||
      v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Add to queue
    utteranceQueueRef.current.push(utterance);
    
    // Start processing if not already speaking
    if (!isSpeakingRef.current) {
      processQueue();
    }
  }, [processQueue]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      utteranceQueueRef.current = [];
      isSpeakingRef.current = false;
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
