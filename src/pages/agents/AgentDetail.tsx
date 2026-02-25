import { Link, Navigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/features/agents/components/PromptCard";
import { FrameworkSwitcher } from "@/features/agents/components/FrameworkSwitcher";
import { VariablePreview } from "@/features/agents/components/VariablePreview";
import { ExportActions } from "@/features/agents/components/ExportActions";
import { usePromptSave } from "@/hooks/usePromptSave";
import { usePromptRating } from "@/hooks/usePromptRating";
import { supabase } from "@/integrations/supabase/client";
import { PromptSchema, PromptVersionSchema, type AgentFramework } from "@/types/agents";
import { FRAMEWORK_LABELS } from "@/features/agents/utils";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";

export default function AgentDetailPage() {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["agent-detail", slug],
    queryFn: async () => {
      const { data: promptRow, error: promptError } = await supabase
        .from("prompts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (promptError) throw promptError;

      const prompt = PromptSchema.parse(promptRow);

      const { data: versionsRows } = await supabase
        .from("prompt_versions")
        .select("*")
        .eq("prompt_id", prompt.id);

      const versions = (versionsRows ?? [])
        .map((row) => PromptVersionSchema.safeParse(row))
        .filter((result) => result.success)
        .map((result) => result.data);

      const { data: relatedRows } = await supabase
        .from("prompts")
        .select("*")
        .eq("industry", prompt.industry)
        .neq("id", prompt.id)
        .eq("status", "published")
        .limit(3);

      const related = (relatedRows ?? [])
        .map((row) => PromptSchema.safeParse(row))
        .filter((result) => result.success)
        .map((result) => result.data);

      return { prompt, versions, related };
    },
    enabled: Boolean(slug),
  });

  const [activeFramework, setActiveFramework] =
    useState<AgentFramework>("raw");

  const promptId = data?.prompt.id ?? "";
  const initialSaves = data?.prompt.saves_count ?? 0;
  const initialRatingAvg = data?.prompt.rating_avg ?? 0;
  const initialRatingCount = data?.prompt.rating_count ?? 0;

  const { isSaved, saveCount, toggleSave, isSaving } = usePromptSave(
    promptId,
    initialSaves,
  );

  const { ratingAvg, ratingCount, submitRating, isSubmitting } = usePromptRating(
    promptId,
    initialRatingAvg,
    initialRatingCount,
  );

  if (!isLoading && !data) return <Navigate to="/agents" replace />;
  if (isLoading || !data) {
    return (
      <Layout>
        <Section className="pt-32">
          <p className="text-muted-foreground">Loading prompt...</p>
        </Section>
      </Layout>
    );
  }

  const { prompt, versions, related } = data;
  const currentVersion =
    versions.find((version) => version.framework === activeFramework) ??
    versions.find((version) => version.framework === "raw");
  const activeContent = currentVersion?.content ?? prompt.system_prompt;

  return (
    <Layout>
      <SEO
        title={`${prompt.title} Blueprint`}
        description={prompt.description}
        image="/brandlogo.png"
        breadcrumbs={[
          { name: "Home", url: "https://hyrx.tech/" },
          { name: "Agents", url: "https://hyrx.tech/agents" },
          {
            name: prompt.industry,
            url: `https://hyrx.tech/agents/industry/${encodeURIComponent(prompt.industry)}`,
          },
          { name: prompt.title, url: `https://hyrx.tech/agents/${prompt.slug}` },
        ]}
      />

      <section className="pt-32 pb-10">
        <div className="container-main space-y-4">
          <p className="text-sm text-muted-foreground">
            <Link to="/">Home</Link> → <Link to="/agents">Agents</Link> → {" "}
            <Link to={`/agents/industry/${encodeURIComponent(prompt.industry)}`}>
              {prompt.industry}
            </Link>{" "}
            → {prompt.title}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{FRAMEWORK_LABELS[prompt.framework]}</Badge>
            <Badge variant="outline">{prompt.industry}</Badge>
            <Badge variant="outline">{prompt.complexity}</Badge>
          </div>
          <h1 className="text-headline">{prompt.title}</h1>
          <p className="text-body-lg max-w-3xl">{prompt.description}</p>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Button variant={isSaved ? "default" : "outline"} disabled={isSaving} onClick={toggleSave}>
              <Heart className="h-4 w-4" /> Save ({saveCount})
            </Button>
            <span className="text-muted-foreground">Rating {ratingAvg.toFixed(1)} ({ratingCount})</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <Button
                  key={score}
                  size="sm"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => submitRating(score)}
                >
                  {score}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section className="section-sm">
        <div className="space-y-8">
          <FrameworkSwitcher
            versions={versions}
            activeFramework={activeFramework}
            onActiveFrameworkChange={setActiveFramework}
          />

          <VariablePreview content={activeContent} />

          <div className="space-y-3">
            <h2 className="text-title">Architecture Notes</h2>
            <p className="text-body">{prompt.notes || "No architecture notes available."}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-title">Compatible Models</h2>
            <div className="flex flex-wrap gap-2">
              {prompt.model_compatibility.map((model) => (
                <Badge key={model} variant="outline">
                  {model}
                </Badge>
              ))}
            </div>
          </div>

          <ExportActions prompt={prompt} versions={versions} activeContent={activeContent} />

          <div className="space-y-4">
            <h2 className="text-title">Related Prompts</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PromptCard key={item.id} prompt={item} />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
