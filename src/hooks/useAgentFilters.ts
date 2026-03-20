import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PromptSchema, type Prompt } from "@/types/agents";

export const AGENTS_PER_PAGE = 20;

export function useAgentFilters(pageOverride?: number) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = pageOverride ?? Number(searchParams.get("page") || "1");
  const query = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "most_saved";

  const framework = searchParams.getAll("framework");
  const industry = searchParams.getAll("industry");
  const model = searchParams.getAll("model");
  const type = searchParams.getAll("type");
  const complexity = searchParams.get("complexity") || "";

  const queryKey = useMemo(
    () => [
      "agent-prompts",
      { page, query, sort, framework, industry, model, type, complexity },
    ],
    [page, query, sort, framework, industry, model, type, complexity],
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      let request = supabase
        .from("prompts")
        .select("*", { count: "exact" })
        .eq("status", "published");

      if (query.trim().length > 0) {
        request = request.textSearch("search_vector", query.trim(), {
          type: "websearch",
          config: "english",
        });
      }

      if (complexity) request = request.eq("complexity", complexity);
      if (framework.length > 0) request = request.in("framework", framework);
      if (industry.length > 0) request = request.in("industry", industry);
      if (type.length > 0) request = request.in("use_case_type", type);
      if (model.length > 0) {
        const orFilters = model.map((value) => `model_compatibility.cs.{${value}}`).join(",");
        request = request.or(orFilters);
      }

      if (sort === "newest") {
        request = request.order("created_at", { ascending: false });
      } else if (sort === "top_rated") {
        request = request.order("rating_avg", { ascending: false });
      } else {
        request = request.order("saves_count", { ascending: false });
      }

      const from = (Math.max(page, 1) - 1) * AGENTS_PER_PAGE;
      const to = from + AGENTS_PER_PAGE - 1;
      request = request.range(from, to);

      const { data: rows, count, error: requestError } = await request;
      if (requestError) throw requestError;

      const prompts = (rows ?? [])
        .map((row) => PromptSchema.safeParse(row))
        .filter((result) => result.success)
        .map((result) => result.data);

      return {
        prompts,
        total: count ?? 0,
      };
    },
  });

  const total = data?.total ?? 0;
  const prompts: Prompt[] = data?.prompts ?? [];
  const hasMore = page * AGENTS_PER_PAGE < total;

  const setSingleParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  };

  const setMultiParam = (key: string, values: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    values.forEach((value) => next.append(key, value));
    next.set("page", "1");
    setSearchParams(next);
  };

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(Math.max(1, nextPage)));
    setSearchParams(next);
  };

  return {
    prompts,
    isLoading,
    error,
    total,
    hasMore,
    page,
    filters: { query, sort, framework, industry, model, type, complexity },
    setSingleParam,
    setMultiParam,
    setPage,
  };
}
