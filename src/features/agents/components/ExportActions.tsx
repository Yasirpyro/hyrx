import { Button } from "@/components/ui/button";
import type { Prompt, PromptVersion } from "@/types/agents";
import { toast } from "sonner";

interface ExportActionsProps {
  prompt: Prompt;
  versions: PromptVersion[];
  activeContent: string;
}

function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportActions({ prompt, versions, activeContent }: ExportActionsProps) {
  const link = `${window.location.origin}/agents/${prompt.slug}`;

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <Button
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(activeContent);
          toast.success("Copied!");
        }}
      >
        📋 Copy
      </Button>

      <Button
        variant="outline"
        onClick={() => downloadFile(`${prompt.slug}.txt`, activeContent, "text/plain")}
      >
        ⬇️ Download .txt
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          downloadFile(
            `${prompt.slug}.json`,
            JSON.stringify({ prompt, versions }, null, 2),
            "application/json",
          )
        }
      >
        ⬇️ Download .json
      </Button>

      <Button
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          toast.success("Link copied");
        }}
      >
        🔗 Share Link
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          const text = encodeURIComponent(`Useful prompt: ${prompt.title} ${link}`);
          window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
        }}
      >
        🐦 Share on X
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          const url = encodeURIComponent(link);
          const title = encodeURIComponent(prompt.title);
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`,
            "_blank",
            "noopener,noreferrer",
          );
        }}
      >
        💼 Share on LinkedIn
      </Button>
    </div>
  );
}
