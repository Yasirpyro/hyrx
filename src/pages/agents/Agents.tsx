import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAgentFilters } from "@/hooks/useAgentFilters";
import { AgentFilters } from "@/features/agents/components/AgentFilters";
import {
  PromptCard,
  PromptCardSkeleton,
} from "@/features/agents/components/PromptCard";
import { FRAMEWORK_LABELS } from "@/features/agents/utils";
import type { AgentFramework } from "@/types/agents";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const AGENT_FAQ = [
  {
    q: "What are AI agent system prompts?",
    a: "AI agent system prompts are pre-written instructions that tell a language model how to behave, what tools to call, and how to format its output. They act as the control layer between your application logic and the underlying LLM.",
  },
  {
    q: "Which frameworks are supported?",
    a: "Our library covers six frameworks: n8n, LangChain, LangGraph, CrewAI, AutoGen, and Raw (framework-agnostic). Each prompt ships in multiple framework variants so you can copy it straight into your stack.",
  },
  {
    q: "Are these prompts free to use?",
    a: "Yes. Every prompt in the HYRX Agent Library is free to copy, modify, and deploy in your own projects — personal or commercial.",
  },
  {
    q: "How do I use a prompt from this library?",
    a: "Click any prompt card, pick the framework tab that matches your stack, and hit Copy. Paste the system prompt into your agent config. If the prompt contains {{variables}}, fill them in with your own values using the live preview.",
  },
  {
    q: "Can I filter prompts by industry or complexity?",
    a: "Absolutely. Use the sidebar filters to narrow results by framework, industry (e.g. Finance, Marketing, DevOps), complexity level, LLM model compatibility, and agent type (single-agent, multi-agent, tool-calling).",
  },
  {
    q: "What models work with these prompts?",
    a: "Each prompt lists its tested models — typically GPT-5.2, Claude 4.6 Sonnet, Gemini 3 Pro, Llama 4, and Mistral Large. You can filter the library by model compatibility to find prompts that match your provider.",
  },
];

export default function AgentsPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { pageNumber } = useParams<{ pageNumber?: string }>();
  const pageFromRoute = pageNumber ? Number(pageNumber) : 1;

  const {
    prompts,
    isLoading,
    total,
    hasMore,
    page,
    filters,
    setSingleParam,
    setMultiParam,
    setPage,
  } = useAgentFilters(pageFromRoute);

  const [searchInput, setSearchInput] = useState(filters.query);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput !== filters.query) setSingleParam("q", searchInput || undefined);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput, filters.query, setSingleParam]);

  useEffect(() => {
    setSearchInput(filters.query);
  }, [filters.query]);

  useEffect(() => {
    const safePage = Number.isFinite(pageFromRoute) && pageFromRoute > 0 ? pageFromRoute : 1;
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [pageFromRoute, page, setPage]);

  useEffect(() => {
    if (page <= 1 && pageNumber) {
      navigate({ pathname: "/agents", search: location.search }, { replace: true });
      return;
    }

    if (page > 1 && pageNumber !== String(page)) {
      navigate({ pathname: `/agents/page/${page}`, search: location.search }, { replace: true });
    }
  }, [page, pageNumber, navigate, location.search]);

  const { data: allModels = [] } = useQuery({
    queryKey: ["agent-models"],
    queryFn: async () => {
      const { data } = await supabase
        .from("prompts")
        .select("model_compatibility")
        .eq("status", "published")
        .limit(1000);

      const models = new Set<string>();
      (data ?? []).forEach((row) => {
        (row.model_compatibility ?? []).forEach((model) => models.add(model));
      });

      return [...models].sort();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["agent-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("prompts")
        .select("framework, industry", { count: "exact" })
        .eq("status", "published")
        .limit(1000);

      const frameworkSet = new Set<string>();
      const industrySet = new Set<string>();
      (data ?? []).forEach((row) => {
        frameworkSet.add(row.framework);
        industrySet.add(row.industry);
      });

      return {
        promptCount: data?.length ?? 0,
        frameworkCount: frameworkSet.size,
        industryCount: industrySet.size,
      };
    },
  });

  const filterPanel = useMemo(
    () => (
      <AgentFilters
        query={searchInput}
        sort={filters.sort}
        framework={filters.framework}
        industry={filters.industry}
        complexity={filters.complexity}
        model={filters.model}
        type={filters.type}
        availableModels={allModels}
        onQueryChange={setSearchInput}
        onSortChange={(value) => setSingleParam("sort", value)}
        onFrameworkChange={(value) => setMultiParam("framework", value)}
        onIndustryChange={(value) => setMultiParam("industry", value)}
        onComplexityChange={(value) => setSingleParam("complexity", value)}
        onModelChange={(value) => setMultiParam("model", value)}
        onTypeChange={(value) => setMultiParam("type", value)}
      />
    ),
    [
      searchInput,
      filters,
      allModels,
      setSingleParam,
      setMultiParam,
      setSearchInput,
    ],
  );

  const goToPage = (nextPage: number) => {
    const normalized = Math.max(1, nextPage);
    setPage(normalized);
    navigate({
      pathname: normalized === 1 ? "/agents" : `/agents/page/${normalized}`,
      search: location.search,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <SEO
        title="Free AI Agent Prompt Library System Prompts for n8n, LangChain, CrewAI & More"
        description={`Browse ${total || stats?.promptCount || 0}+ free, copy-ready AI agent system prompts. Filter by framework (n8n, LangChain, LangGraph, CrewAI, AutoGen), industry, complexity, and LLM model. Production-tested and open to use.`}
        breadcrumbs={[
          { name: "Home", url: "https://hyrx.tech/" },
          { name: "AI Agent Library", url: "https://hyrx.tech/agents" },
        ]}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "HYRX AI Agent Prompt Library",
          description: `Browse ${total || stats?.promptCount || 0}+ free, production-ready AI agent system prompts for n8n, LangChain, LangGraph, CrewAI, and AutoGen.`,
          url: "https://hyrx.tech/agents",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: total || stats?.promptCount || 0,
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

      <section className="pt-32 pb-12">
        <div className="container-main space-y-5">
          <p className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            {" → "}
            <span>AI Agent Library</span>
          </p>
          <h1 className="text-display max-w-4xl">
            Free <span className="gradient-text">AI Agent Prompts</span> Copy, Paste &amp; Deploy
          </h1>
          <p className="text-body-lg max-w-3xl">
            Production-tested system prompts for <strong>n8n</strong>, <strong>LangChain</strong>,{" "}
            <strong>LangGraph</strong>, <strong>CrewAI</strong>, <strong>AutoGen</strong>,
            and raw LLM configs. Filter by industry, complexity, or model — then copy straight
            into your agent stack.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium">
              {stats?.promptCount ?? 0} Prompts
            </span>
            <span aria-hidden>·</span>
            <span>{stats?.frameworkCount ?? 0} Frameworks</span>
            <span aria-hidden>·</span>
            <span>{stats?.industryCount ?? 0} Industries</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {(Object.entries(FRAMEWORK_LABELS) as [AgentFramework, string][]).map(([key, label]) => (
              <Link
                key={key}
                to={`/agents/frameworks/${key}`}
                className="inline-flex items-center rounded-full border border-border/50 bg-card/80 px-3 py-1 text-xs font-medium hover:border-primary/40 transition-colors"
              >
                {label} Prompts
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section className="section-sm">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {isMobile ? (
            <div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Filters</Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">{filterPanel}</div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div>{filterPanel}</div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <PromptCardSkeleton key={index} />
                ))}
              </div>
            ) : prompts.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
                No prompts found for current filters.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {prompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                disabled={!hasMore}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* SEO-rich content block — visible to crawlers and first-time visitors */}
      <Section className="section-sm">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-title">What You'll Find in the HYRX AI Agent Library</h2>
          <p className="text-body text-muted-foreground">
            The HYRX Agent Library is a growing, open-access collection of <strong>AI agent system prompts</strong>{" "}
            built for real production use. Each prompt is structured with clear role definitions,
            tool-calling instructions, output formatting rules, and guardrails — ready to drop
            into your workflow with zero boilerplate.
          </p>
          <p className="text-body text-muted-foreground">
            Every prompt ships in up to six framework variants: <strong>n8n</strong> (node-first automation),{" "}
            <strong>LangChain</strong> (composable tool-calling chains), <strong>LangGraph</strong>{" "}
            (stateful multi-step execution), <strong>CrewAI</strong> (role-based agent crews),{" "}
            <strong>AutoGen</strong> (message-driven multi-agent), and <strong>Raw</strong>{" "}
            (provider-agnostic). Pick the variant that matches your stack and copy.
          </p>
          <p className="text-body text-muted-foreground">
            Prompts span industries like <strong>Marketing</strong>, <strong>Finance</strong>,{" "}
            <strong>DevOps</strong>, <strong>Customer Support</strong>, <strong>Compliance</strong>,{" "}
            and <strong>eCommerce</strong>. Use the filters to narrow by complexity (<em>beginner</em>,{" "}
            <em>intermediate</em>, <em>advanced</em>) and agent type (<em>single-agent</em>,{" "}
            <em>multi-agent</em>, <em>tool-calling</em>).
          </p>
        </div>
      </Section>

      {/* FAQ section with JSON-LD FAQPage schema */}
      <Section className="section-sm">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-title">Frequently Asked Questions</h2>
          <Accordion type="multiple" className="w-full">
            {AGENT_FAQ.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        {/* FAQ schema injected via a hidden script for SSR / prerender */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: AGENT_FAQ.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.a,
                },
              })),
            }),
          }}
        />
      </Section>
    </Layout>
  );
}
