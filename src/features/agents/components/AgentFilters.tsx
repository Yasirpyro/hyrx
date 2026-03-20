import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FRAMEWORK_LABELS } from "@/features/agents/utils";
import type { AgentFramework } from "@/types/agents";

interface AgentFiltersProps {
  query: string;
  sort: string;
  framework: string[];
  industry: string[];
  complexity: string;
  model: string[];
  type: string[];
  availableModels: string[];
  onQueryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onFrameworkChange: (values: string[]) => void;
  onIndustryChange: (values: string[]) => void;
  onComplexityChange: (value?: string) => void;
  onModelChange: (values: string[]) => void;
  onTypeChange: (values: string[]) => void;
}

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

const TYPES = ["single-agent", "multi-agent", "tool-calling"];

function MultiPill({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = selected.includes(option);
        return (
          <button
            type="button"
            key={option}
            onClick={() => {
              if (isActive) onChange(selected.filter((value) => value !== option));
              else onChange([...selected, option]);
            }}
          >
            <Badge
              variant={isActive ? "default" : "outline"}
              className={cn("cursor-pointer", isActive ? "" : "hover:border-primary/40")}
            >
              {option}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

export function AgentFilters(props: AgentFiltersProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-border/50 bg-card p-5">
      <div className="space-y-2">
        <p className="text-sm font-medium">Search</p>
        <Input
          value={props.query}
          onChange={(event) => props.onQueryChange(event.target.value)}
          placeholder="Search prompts..."
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Sort</p>
        <Select value={props.sort} onValueChange={props.onSortChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="most_saved">Most Saved</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="top_rated">Top Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Framework</p>
        <MultiPill
          options={Object.keys(FRAMEWORK_LABELS).map(
            (key) => FRAMEWORK_LABELS[key as AgentFramework],
          )}
          selected={props.framework.map((value) => FRAMEWORK_LABELS[value as AgentFramework] ?? value)}
          onChange={(selectedLabels) => {
            const selectedValues = selectedLabels
              .map((label) => {
                const entry = Object.entries(FRAMEWORK_LABELS).find(([, val]) => val === label);
                return entry?.[0] ?? "";
              })
              .filter(Boolean);
            props.onFrameworkChange(selectedValues);
          }}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Industry</p>
        <MultiPill
          options={INDUSTRIES}
          selected={props.industry}
          onChange={props.onIndustryChange}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Complexity</p>
        <Select
          value={props.complexity || "all"}
          onValueChange={(value) => props.onComplexityChange(value === "all" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Model</p>
        <MultiPill
          options={props.availableModels}
          selected={props.model}
          onChange={props.onModelChange}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Type</p>
        <MultiPill options={TYPES} selected={props.type} onChange={props.onTypeChange} />
      </div>
    </div>
  );
}
