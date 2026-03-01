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
import { FRAMEWORK_LABELS, toTitleCase } from "@/features/agents/utils";
import { useQuery } from "@tanstack/react-query";
import { Heart, ChevronRight } from "lucide-react";

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
        title={`${prompt.title} — Free ${FRAMEWORK_LABELS[prompt.framework]} Agent Prompt`}
        description={`${prompt.description} Copy this free ${toTitleCase(prompt.complexity)} ${FRAMEWORK_LABELS[prompt.framework]} system prompt for ${prompt.industry}. Works with ${prompt.model_compatibility.slice(0, 3).join(", ")}.`}
        image="/brandlogo.png"
        breadcrumbs={[
          { name: "Home", url: "https://hyrx.tech/" },
          { name: "AI Agent Library", url: "https://hyrx.tech/agents" },
          {
            name: prompt.industry,
            url: `https://hyrx.tech/agents/industry/${encodeURIComponent(prompt.industry)}`,
          },
          { name: prompt.title, url: `https://hyrx.tech/agents/${prompt.slug}` },
        ]}
        schema={{
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: prompt.title,
          description: prompt.description,
          url: `https://hyrx.tech/agents/${prompt.slug}`,
          codeRepository: "https://hyrx.tech/agents",
          programmingLanguage: FRAMEWORK_LABELS[prompt.framework],
          runtimePlatform: prompt.model_compatibility.join(", "),
          applicationCategory: "AI Agent System Prompt",
          keywords: [
            ...prompt.tags,
            prompt.industry,
            FRAMEWORK_LABELS[prompt.framework],
            "AI agent prompt",
            "system prompt",
            prompt.complexity,
          ].join(", "),
          aggregateRating: prompt.rating_count > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: prompt.rating_avg.toFixed(1),
                ratingCount: prompt.rating_count,
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
          author: {
            "@type": "Organization",
            name: "HYRX",
            url: "https://hyrx.tech",
          },
          dateCreated: prompt.created_at,
          dateModified: prompt.updated_at,
        }}
      />

      <section className="pt-32 pb-10">
        <div className="container-main space-y-4">
          <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/agents" className="hover:text-primary transition-colors">Agent Library</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/agents/industry/${encodeURIComponent(prompt.industry)}`} className="hover:text-primary transition-colors">
              {prompt.industry}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{prompt.title}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/agents/frameworks/${prompt.framework}`}>
              <Badge variant="outline" className="hover:border-primary/40 transition-colors">
                {FRAMEWORK_LABELS[prompt.framework]}
              </Badge>
            </Link>
            <Link to={`/agents/industry/${encodeURIComponent(prompt.industry)}`}>
              <Badge variant="outline" className="hover:border-primary/40 transition-colors">
                {prompt.industry}
              </Badge>
            </Link>
            <Badge variant="outline">{toTitleCase(prompt.complexity)}</Badge>
            <Badge variant="outline">{toTitleCase(prompt.use_case_type)}</Badge>
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
            <p className="text-sm text-muted-foreground">
              This prompt has been tested with the following large language models:
            </p>
            <div className="flex flex-wrap gap-2">
              {prompt.model_compatibility.map((model) => (
                <Badge key={model} variant="outline">
                  {model}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-title">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <Link key={tag} to={`/agents?q=${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20 transition-colors">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          <ExportActions prompt={prompt} versions={versions} activeContent={activeContent} />

          {related.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-title">Related {prompt.industry} Prompts</h2>
              <p className="text-sm text-muted-foreground">
                More AI agent system prompts for {prompt.industry} — same industry, different use cases.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <PromptCard key={item.id} prompt={item} />
                ))}
              </div>
              <div className="pt-2">
                <Button asChild variant="outline">
                  <Link to={`/agents/industry/${encodeURIComponent(prompt.industry)}`}>
                    Browse all {prompt.industry} prompts →
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </Layout>
  );
}
