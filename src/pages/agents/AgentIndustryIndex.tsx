import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { PromptCard } from "@/features/agents/components/PromptCard";
import { PromptSchema } from "@/types/agents";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <Layout>
      <SEO
        title={`${industryLabel} AI Agent Prompts`}
        description={`Browse HYRX prompt blueprints for ${industryLabel}.`}
      />

      <section className="pt-32 pb-10">
        <div className="container-main space-y-3">
          <h1 className="text-headline">{industryLabel} Agent Prompts</h1>
          <p className="text-body-lg">
            Industry-specific system prompts curated for real-world operations.
          </p>
        </div>
      </section>

      <Section className="section-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </Section>
    </Layout>
  );
}
