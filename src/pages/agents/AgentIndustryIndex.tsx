import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/features/agents/components/PromptCard";
import { FRAMEWORK_LABELS } from "@/features/agents/utils";
import { PromptSchema, type AgentFramework } from "@/types/agents";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";

const INDUSTRIES = [
  "Business Ops",
  "Marketing",
  "Compliance",
  "DevOps",
  "Customer Support",
  "Research",
  "Finance",
  "eCommerce",
];

export default function AgentIndustryIndexPage() {
  const { industry = "" } = useParams<{ industry: string }>();
  const industryLabel = decodeURIComponent(industry);

  const { data: prompts = [] } = useQuery({
    queryKey: ["industry-prompts", industryLabel],
    queryFn: async () => {
      const { data } = await supabase
        .from("prompts")
        .select("*")
        .eq("industry", industryLabel)
        .eq("status", "published")
        .order("saves_count", { ascending: false });

      return (data ?? [])
        .map((row) => PromptSchema.safeParse(row))
        .filter((result) => result.success)
        .map((result) => result.data);
    },
    enabled: Boolean(industryLabel),
  });

  const otherIndustries = INDUSTRIES.filter(
    (ind) => ind.toLowerCase() !== industryLabel.toLowerCase(),
  );

  // Collect unique frameworks from prompts for cross-linking
  const uniqueFrameworks = [...new Set(prompts.map((p) => p.framework))];

  return (
    <Layout>
      <SEO
        title={`Free ${industryLabel} AI Agent Prompts — System Prompts for ${industryLabel}`}
        description={`Browse ${prompts.length}+ free AI agent system prompts for ${industryLabel}. Production-ready prompts across n8n, LangChain, LangGraph, CrewAI, and AutoGen — copy and deploy instantly.`}
        breadcrumbs={[
          { name: "Home", url: "https://hyrx.tech/" },
          { name: "AI Agent Library", url: "https://hyrx.tech/agents" },
          { name: `${industryLabel} Prompts`, url: `https://hyrx.tech/agents/industry/${encodeURIComponent(industryLabel)}` },
        ]}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${industryLabel} AI Agent Prompts`,
          description: `Free, production-ready AI agent system prompts curated for ${industryLabel} operations.`,
          url: `https://hyrx.tech/agents/industry/${encodeURIComponent(industryLabel)}`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: prompts.length,
            itemListElement: prompts.slice(0, 10).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://hyrx.tech/agents/${p.slug}`,
              name: p.title,
            })),
          },
          isPartOf: {
            "@type": "WebSite",
            name: "HYRX",
            url: "https://hyrx.tech",
          },
        }}
      />

      <section className="pt-32 pb-10">
        <div className="container-main space-y-4">
          <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/agents" className="hover:text-primary transition-colors">Agent Library</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{industryLabel}</span>
          </nav>
          <h1 className="text-headline">{industryLabel} AI Agent Prompts</h1>
          <p className="text-body-lg max-w-3xl">
            Industry-specific AI agent system prompts curated for real-world {industryLabel.toLowerCase()} operations.
            Each prompt is production-tested and ships in multiple framework variants.
          </p>
          <p className="text-sm text-muted-foreground">
            {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} available
            {uniqueFrameworks.length > 0 && (
              <> across {uniqueFrameworks.map((f) => FRAMEWORK_LABELS[f]).join(", ")}</>
            )}
          </p>
        </div>
      </section>

      <Section className="section-sm">
        {prompts.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
            No {industryLabel} prompts published yet. Check back soon or{" "}
            <Link to="/agents" className="text-primary hover:underline">browse the full library</Link>.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </Section>

      {/* Cross-link other industries */}
      <Section className="section-sm">
        <div className="space-y-4">
          <h2 className="text-title">Browse Other Industries</h2>
          <p className="text-sm text-muted-foreground">
            Explore AI agent prompts for other industries and verticals:
          </p>
          <div className="flex flex-wrap gap-2">
            {otherIndustries.map((ind) => (
              <Button key={ind} asChild variant="outline" size="sm">
                <Link to={`/agents/industry/${encodeURIComponent(ind)}`}>
                  {ind}
                </Link>
              </Button>
            ))}
          </div>
          <div className="pt-2">
            <Button asChild variant="outline">
              <Link to="/agents">← Back to full library</Link>
            </Button>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
