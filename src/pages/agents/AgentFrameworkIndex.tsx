import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/features/agents/components/PromptCard";
import { AGENT_FRAMEWORKS, FRAMEWORK_INTROS, FRAMEWORK_LABELS } from "@/features/agents/utils";
import { PromptSchema, type AgentFramework } from "@/types/agents";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";

const FRAMEWORK_SEO_DESCRIPTIONS: Record<AgentFramework, string> = {
  n8n: "Browse free n8n AI agent system prompts. Copy production-ready, node-first automation prompts built for n8n workflows with explicit tool and output steps.",
  langchain: "Browse free LangChain AI agent system prompts. Copy production-ready prompts optimized for tool-calling, composable chains, and retrieval-augmented generation.",
  langgraph: "Browse free LangGraph AI agent system prompts. Copy stateful, multi-step execution prompts designed for durable agent workflows and conditional branching.",
  crewai: "Browse free CrewAI AI agent system prompts. Copy role-based prompts built for collaborative multi-agent crews with structured handoffs.",
  autogen: "Browse free AutoGen AI agent system prompts. Copy message-driven, multi-agent coordination prompts for autonomous group conversations.",
  raw: "Browse free raw AI agent system prompts. Copy provider-agnostic system prompts with no framework wrapper — works with any LLM API.",
};

export default function AgentFrameworkIndexPage() {
  const { framework = "raw" } = useParams<{ framework: AgentFramework }>();
  const frameworkKey = (framework || "raw") as AgentFramework;

  const { data: prompts = [] } = useQuery({
    queryKey: ["framework-prompts", frameworkKey],
    queryFn: async () => {
      const { data } = await supabase
        .from("prompts")
        .select("*")
        .eq("framework", frameworkKey)
        .eq("status", "published")
        .order("saves_count", { ascending: false });

      return (data ?? [])
        .map((row) => PromptSchema.safeParse(row))
        .filter((result) => result.success)
        .map((result) => result.data);
    },
  });

  const frameworkLabel = FRAMEWORK_LABELS[frameworkKey] ?? frameworkKey;
  const otherFrameworks = AGENT_FRAMEWORKS.filter((f) => f !== frameworkKey);

  return (
    <Layout>
      <SEO
        title={`Free ${frameworkLabel} AI Agent Prompts — System Prompts for ${frameworkLabel}`}
        description={FRAMEWORK_SEO_DESCRIPTIONS[frameworkKey]}
        breadcrumbs={[
          { name: "Home", url: "https://hyrx.tech/" },
          { name: "AI Agent Library", url: "https://hyrx.tech/agents" },
          { name: `${frameworkLabel} Prompts`, url: `https://hyrx.tech/agents/frameworks/${frameworkKey}` },
        ]}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${frameworkLabel} AI Agent Prompts`,
          description: FRAMEWORK_SEO_DESCRIPTIONS[frameworkKey],
          url: `https://hyrx.tech/agents/frameworks/${frameworkKey}`,
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
            <span className="text-foreground">{frameworkLabel} Prompts</span>
          </nav>
          <h1 className="text-headline">{frameworkLabel} AI Agent Prompts</h1>
          <p className="text-body-lg max-w-3xl">{FRAMEWORK_INTROS[frameworkKey]}</p>
          <p className="text-sm text-muted-foreground">
            {prompts.length} {frameworkLabel} prompt{prompts.length !== 1 ? "s" : ""} available — free to copy and deploy.
          </p>
        </div>
      </section>

      <Section className="section-sm">
        {prompts.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
            No {frameworkLabel} prompts published yet. Check back soon.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </Section>

      {/* Cross-link other frameworks */}
      <Section className="section-sm">
        <div className="space-y-4">
          <h2 className="text-title">Browse Other Frameworks</h2>
          <p className="text-sm text-muted-foreground">
            Looking for a different framework? Explore prompts for other agent stacks:
          </p>
          <div className="flex flex-wrap gap-2">
            {otherFrameworks.map((f) => (
              <Button key={f} asChild variant="outline" size="sm">
                <Link to={`/agents/frameworks/${f}`}>
                  {FRAMEWORK_LABELS[f]} Prompts
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
