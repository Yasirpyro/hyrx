import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePromptSave } from "@/hooks/usePromptSave";
import { Copy, Heart, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { FRAMEWORK_LABELS, toTitleCase } from "@/features/agents/utils";
import type { Prompt } from "@/types/agents";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const { isSaved, saveCount, toggleSave, isSaving } = usePromptSave(
    prompt.id,
    prompt.saves_count,
  );

  const onCopy = async () => {
    await navigator.clipboard.writeText(prompt.system_prompt);
    toast.success("Prompt copied");
  };

  const onShare = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/agents/${prompt.slug}`);
    toast.success("Link copied");
  };

  const visibleTags = prompt.tags.slice(0, 4);
  const hiddenTagCount = Math.max(0, prompt.tags.length - visibleTags.length);

  return (
    <Card className="h-full border-border/50 bg-card/80">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{FRAMEWORK_LABELS[prompt.framework]}</Badge>
          <Badge variant="outline">{prompt.industry}</Badge>
          <Badge variant="outline">{toTitleCase(prompt.complexity)}</Badge>
        </div>
        <CardTitle className="text-xl leading-tight">{prompt.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{prompt.description}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
          {hiddenTagCount > 0 && <Badge variant="outline">+{hiddenTagCount} more</Badge>}
        </div>

        <div className="flex flex-wrap gap-2">
          {prompt.model_compatibility.slice(0, 4).map((model) => (
            <Badge key={model} variant="outline">
              {model}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{saveCount} saves</span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            {prompt.rating_avg.toFixed(1)} ({prompt.rating_count})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="h-4 w-4" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button variant={isSaved ? "default" : "outline"} size="sm" disabled={isSaving} onClick={toggleSave}>
            <Heart className="h-4 w-4" /> Save
          </Button>
          <Button asChild size="sm">
            <Link to={`/agents/${prompt.slug}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PromptCardSkeleton() {
  return (
    <Card className="h-full border-border/50 bg-card/80">
      <CardHeader className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}
