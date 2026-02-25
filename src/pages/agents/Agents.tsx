import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useAgentFilters } from "@/hooks/useAgentFilters";
import { AgentFilters } from "@/features/agents/components/AgentFilters";
import {
  PromptCard,
  PromptCardSkeleton,
} from "@/features/agents/components/PromptCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
        title="AI Agent Prompt Library — Free System Prompts for n8n, LangChain & More"
        description={`Browse ${total || stats?.promptCount || 0} copy-ready AI agent prompts with filterable framework and industry views.`}
      />

      <section className="pt-32 pb-12">
        <div className="container-main space-y-5">
          <h1 className="text-display max-w-4xl">
            Production <span className="gradient-text">System Prompts</span> for Real AI Agents
          </h1>
          <p className="text-body-lg max-w-3xl">
            Copy-ready, framework-specific prompts for n8n, LangChain, LangGraph, CrewAI and more.
          </p>
          <p className="text-sm text-muted-foreground">
            {stats?.promptCount ?? 0} Prompts · {stats?.frameworkCount ?? 0} Frameworks · {stats?.industryCount ?? 0} Industries
          </p>
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
    </Layout>
  );
}
