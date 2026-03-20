import { z } from "zod";

export const AgentFrameworkSchema = z.enum([
  "n8n",
  "langchain",
  "langgraph",
  "crewai",
  "autogen",
  "raw",
]);

export const AgentComplexitySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

export const AgentUseCaseTypeSchema = z.enum([
  "single-agent",
  "multi-agent",
  "tool-calling",
]);

export const AgentStatusSchema = z.enum(["published", "draft"]);

export const PromptSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  notes: z.string(),
  system_prompt: z.string(),
  framework: AgentFrameworkSchema,
  industry: z.string(),
  complexity: AgentComplexitySchema,
  model_compatibility: z.array(z.string()),
  variables: z.array(z.string()),
  tags: z.array(z.string()),
  use_case_type: AgentUseCaseTypeSchema,
  saves_count: z.number().int(),
  rating_avg: z.number(),
  rating_count: z.number().int(),
  status: AgentStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const PromptVersionSchema = z.object({
  id: z.string().uuid(),
  prompt_id: z.string().uuid(),
  framework: AgentFrameworkSchema,
  content: z.string(),
  created_at: z.string(),
});

export const SaveSchema = z.object({
  id: z.string().uuid(),
  prompt_id: z.string().uuid(),
  fingerprint: z.string(),
  created_at: z.string(),
});

export const RatingSchema = z.object({
  id: z.string().uuid(),
  prompt_id: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  fingerprint: z.string(),
  created_at: z.string(),
});

export type AgentFramework = z.infer<typeof AgentFrameworkSchema>;
export type AgentComplexity = z.infer<typeof AgentComplexitySchema>;
export type AgentUseCaseType = z.infer<typeof AgentUseCaseTypeSchema>;
export type AgentStatus = z.infer<typeof AgentStatusSchema>;
export type Prompt = z.infer<typeof PromptSchema>;
export type PromptVersion = z.infer<typeof PromptVersionSchema>;
export type Save = z.infer<typeof SaveSchema>;
export type Rating = z.infer<typeof RatingSchema>;

export type PromptWithVersions = Prompt & {
  prompt_versions?: PromptVersion[];
};
