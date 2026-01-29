// Streaming chat utility with sentence buffering for TTS

export type ChatMessage = { role: "user" | "assistant"; content: string };

interface StreamChatOptions {
  messages: ChatMessage[];
  onDelta: (deltaText: string) => void;
  onSentence?: (sentence: string) => void; // Called when a complete sentence is detected
  onDone: () => void;
  onError?: (error: Error) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hyrx-chat`;

// Sentence-ending punctuation pattern
const SENTENCE_END_REGEX = /[.!?]+\s*/;

export async function streamChat({
  messages,
  onDelta,
  onSentence,
  onDone,
  onError,
}: StreamChatOptions): Promise<void> {
  let sentenceBuffer = "";

  const flushSentences = (text: string, force: boolean = false) => {
    sentenceBuffer += text;
    
    if (!onSentence) return;

    // Keep extracting complete sentences from the buffer
    let match: RegExpExecArray | null;
    while ((match = SENTENCE_END_REGEX.exec(sentenceBuffer)) !== null) {
      const endIndex = match.index + match[0].length;
      const sentence = sentenceBuffer.slice(0, endIndex).trim();
      if (sentence) {
        onSentence(sentence);
      }
      sentenceBuffer = sentenceBuffer.slice(endIndex);
    }

    // On final flush, send any remaining text
    if (force && sentenceBuffer.trim()) {
      onSentence(sentenceBuffer.trim());
      sentenceBuffer = "";
    }
  };

  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, stream: true }),
    });

    // Handle rate limit and payment errors
    if (resp.status === 429) {
      throw new Error("Too many requests. Please try again in a moment.");
    }
    if (resp.status === 402) {
      throw new Error("AI service temporarily unavailable. Please contact us at contact@hyrx.tech");
    }
    if (!resp.ok || !resp.body) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      // Process line-by-line as data arrives
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1); // handle CRLF
        if (line.startsWith(":") || line.trim() === "") continue; // SSE comments/keepalive
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            onDelta(content);
            flushSentences(content);
          }
        } catch {
          // Incomplete JSON split across chunks: put it back and wait for more data
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush in case remaining buffered lines arrived without trailing newline
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            onDelta(content);
            flushSentences(content);
          }
        } catch {
          /* ignore partial leftovers */
        }
      }
    }

    // Flush any remaining sentence buffer
    flushSentences("", true);
    onDone();
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown streaming error");
    console.error("Stream chat error:", error);
    onError?.(error);
    throw error;
  }
}
