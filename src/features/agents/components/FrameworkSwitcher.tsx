import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FRAMEWORK_LABELS, AGENT_FRAMEWORKS } from "@/features/agents/utils";
import type { AgentFramework, PromptVersion } from "@/types/agents";
import { Highlight, themes } from "prism-react-renderer";
import { toast } from "sonner";

interface FrameworkSwitcherProps {
  versions: PromptVersion[];
  activeFramework?: AgentFramework;
  onActiveFrameworkChange?: (framework: AgentFramework) => void;
}

export function FrameworkSwitcher({
  versions,
  activeFramework,
  onActiveFrameworkChange,
}: FrameworkSwitcherProps) {
  const [internalActive, setInternalActive] = useState<AgentFramework>("raw");
  const active = activeFramework ?? internalActive;

  const setActive = (framework: AgentFramework) => {
    if (onActiveFrameworkChange) onActiveFrameworkChange(framework);
    else setInternalActive(framework);
  };

  const byFramework = useMemo(() => {
    const map = new Map<AgentFramework, PromptVersion>();
    versions.forEach((version) => map.set(version.framework, version));
    return map;
  }, [versions]);

  const current = byFramework.get(active);

  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {AGENT_FRAMEWORKS.map((framework) => (
          <button key={framework} type="button" onClick={() => setActive(framework)}>
            <Badge variant={framework === active ? "default" : "outline"}>
              {FRAMEWORK_LABELS[framework]}
            </Badge>
          </button>
        ))}
      </div>

      {!current ? (
        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
          Not available for this framework yet.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between">
            <p className="text-sm font-medium">{FRAMEWORK_LABELS[current.framework]} Prompt</p>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(current.content);
                toast.success("Copied");
              }}
            >
              Copy
            </Button>
          </div>
          <Highlight theme={themes.vsDark} code={current.content} language="markdown">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={`${className} overflow-x-auto rounded-xl p-4 text-xs`} style={style}>
                {tokens.map((line, index) => (
                  <div key={index} {...getLineProps({ line })}>
                    {line.map((token, tokenIndex) => (
                      <span key={tokenIndex} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      )}
    </div>
  );
}
