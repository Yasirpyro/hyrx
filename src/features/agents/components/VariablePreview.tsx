import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPromptVariables, fillPromptVariables } from "@/features/agents/utils";
import { toast } from "sonner";

interface VariablePreviewProps {
  content: string;
}

export function VariablePreview({ content }: VariablePreviewProps) {
  const variableNames = useMemo(() => getPromptVariables(content), [content]);
  const [values, setValues] = useState<Record<string, string>>({});

  const preview = useMemo(() => fillPromptVariables(content, values), [content, values]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl border border-border/50 bg-card p-4">
        <h3 className="text-sm font-semibold">Fill Variables</h3>
        {variableNames.length === 0 ? (
          <p className="text-sm text-muted-foreground">No variables detected in this prompt.</p>
        ) : (
          <div className="space-y-3">
            {variableNames.map((name) => (
              <div key={name} className="space-y-1">
                <p className="text-xs text-muted-foreground">{name}</p>
                <Input
                  value={values[name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [name]: event.target.value }))
                  }
                  placeholder={`Enter ${name}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-border/50 bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Live Preview</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(preview);
              toast.success("Copied filled prompt");
            }}
          >
            Copy filled prompt
          </Button>
        </div>
        <pre className="max-h-[320px] overflow-auto rounded-lg bg-muted/20 p-3 text-xs whitespace-pre-wrap">
          {preview}
        </pre>
      </div>
    </div>
  );
}
