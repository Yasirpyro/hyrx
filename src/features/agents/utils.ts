import type { AgentFramework } from "@/types/agents";

export const AGENT_FRAMEWORKS: AgentFramework[] = [
  "n8n",
  "langchain",
  "langgraph",
  "crewai",
  "autogen",
  "raw",
];

export const FRAMEWORK_LABELS: Record<AgentFramework, string> = {
  n8n: "n8n",
  langchain: "LangChain",
  langgraph: "LangGraph",
  crewai: "CrewAI",
  autogen: "AutoGen",
  raw: "Raw",
};

export const FRAMEWORK_INTROS: Record<AgentFramework, string> = {
  n8n: "n8n prompts focus on node-first automation with explicit tool and output steps.",
  langchain: "LangChain prompts favor tool-calling and composable chain components.",
  langgraph: "LangGraph variants are stateful and suited for durable multi-step execution.",
  crewai: "CrewAI variants optimize role handoffs across collaborative agent crews.",
  autogen: "AutoGen variants are designed for message-driven multi-agent coordination.",
  raw: "Raw variants provide provider-agnostic system prompts with no framework wrapper.",
};

export function getPromptVariables(content: string): string[] {
  const regex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  const unique = new Set<string>();
  for (const match of content.matchAll(regex)) {
    if (match[1]) unique.add(match[1]);
  }
  return [...unique];
}

export function fillPromptVariables(
  content: string,
  values: Record<string, string>,
): string {
  return content.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g, (_, variable: string) => {
    const value = values[variable];
    return value && value.trim().length > 0 ? value : `{{${variable}}}`;
  });
}

export function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}
