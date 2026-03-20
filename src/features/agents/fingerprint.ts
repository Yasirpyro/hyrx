const FINGERPRINT_KEY = "hyrx-agent-fingerprint";

export function getOrCreateFingerprint(): string {
  if (typeof window === "undefined") return "server";

  const existing = localStorage.getItem(FINGERPRINT_KEY);
  if (existing) return existing;

  const payload = [
    navigator.userAgent,
    String(window.screen.width),
    String(window.screen.height),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");

  const encoded = btoa(payload);
  localStorage.setItem(FINGERPRINT_KEY, encoded);
  return encoded;
}

export function getSavedPromptSet(): Set<string> {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const raw = localStorage.getItem("hyrx-agent-saves");
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

export function persistSavedPromptSet(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("hyrx-agent-saves", JSON.stringify([...ids]));
}
