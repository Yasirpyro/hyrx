import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { PromptCard } from "@/features/agents/components/PromptCard";
import { FRAMEWORK_INTROS, FRAMEWORK_LABELS } from "@/features/agents/utils";
import { PromptSchema, type AgentFramework } from "@/types/agents";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <Layout>
      <SEO
        title={`${frameworkLabel} Agent Prompts`}
        description={`Browse HYRX prompt blueprints for ${frameworkLabel}.`}
      />

      <section className="pt-32 pb-10">
        <div className="container-main space-y-3">
          <h1 className="text-headline">{frameworkLabel} Agent Prompts</h1>
          <p className="text-body-lg">{FRAMEWORK_INTROS[frameworkKey]}</p>
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
