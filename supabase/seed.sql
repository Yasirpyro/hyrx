-- LAST_VERIFIED: 2026-02-24
-- Agent Library seed aligned with structured prompt format and framework variants.

insert into public.prompts (
  slug,
  title,
  description,
  notes,
  system_prompt,
  framework,
  industry,
  complexity,
  model_compatibility,
  variables,
  tags,
  use_case_type,
  status
)
values
('lead-qualifier-agent','Lead Qualifier Agent','Scores inbound leads and recommends next actions.','Use after form/webhook capture to triage sales effort.','placeholder','n8n','Business Ops','intermediate', array['gpt-5.2','claude-sonnet-4-6','gemini-2.5-pro'], array['company_name','lead_source','crm_system'], array['lead-gen','crm','qualification'], 'tool-calling','published'),
('crm-updater-agent','CRM Updater Agent','Normalizes notes and updates CRM records safely.','Designed for HubSpot/Salesforce sync jobs.','placeholder','langchain','Business Ops','advanced', array['gpt-5-mini','claude-haiku-4-5','gemini-2.5-flash'], array['crm_system','confidence_threshold'], array['crm','ops','normalization'], 'tool-calling','published'),
('meeting-summarizer-agent','Meeting Summarizer Agent','Creates decision-focused summaries and action logs.','Optimized for weekly standups and client calls.','placeholder','raw','Business Ops','beginner', array['gpt-5-mini','claude-sonnet-4-6','gemini-2.5-flash-lite'], array['team_name','meeting_type'], array['meeting','summary','ops'], 'single-agent','published'),
('social-content-agent','Social Media Content Generator','Generates platform-specific post variants with CTA testing.','Use for campaign ideation and copy variants.','placeholder','crewai','Marketing','intermediate', array['gpt-5.2','claude-opus-4-6','gemini-3-pro-preview'], array['brand_voice','campaign_goal','target_audience'], array['marketing','social','content'], 'single-agent','published'),
('seo-brief-writer-agent','SEO Brief Writer Agent','Builds structured SEO briefs from a keyword and SERP context.','For content teams publishing long-form pages.','placeholder','langgraph','Marketing','advanced', array['gpt-5.2','claude-sonnet-4-6','gemini-2.5-pro'], array['primary_keyword','target_region'], array['seo','content-strategy'], 'tool-calling','published'),
('ad-copy-tester-agent','Ad Copy Tester Agent','Evaluates ad copy and proposes controlled experiments.','Use before launch in paid channels.','placeholder','autogen','Marketing','intermediate', array['gpt-5-mini','claude-haiku-4-5','gemini-2.5-flash'], array['industry_policy','offer_name'], array['ads','experiments','marketing'], 'multi-agent','published'),
('gdpr-compliance-checker-agent','GDPR Compliance Checker','Flags GDPR risks in workflows and data handling procedures.','Use for pre-launch policy reviews.','placeholder','raw','Compliance','advanced', array['gpt-5.2','claude-opus-4-6','gemini-2.5-pro'], array['jurisdiction','data_categories'], array['gdpr','privacy','compliance'], 'single-agent','published'),
('contract-reviewer-agent','Contract Reviewer Agent','Reviews contract clauses and highlights negotiation risks.','Supports legal ops pre-review workflow.','placeholder','langchain','Compliance','advanced', array['gpt-5.2','claude-opus-4-6','gemini-2.5-pro'], array['contract_type','risk_tolerance'], array['legal','contracts','review'], 'tool-calling','published'),
('code-review-agent','Code Reviewer Agent','Performs static review and prioritized feedback for PRs.','For async code quality checks.','placeholder','langgraph','DevOps','advanced', array['gpt-5.2-codex','claude-sonnet-4-6','devstral-2-25-12'], array['repo_name','language_stack'], array['code-review','engineering','quality'], 'tool-calling','published'),
('pr-summarizer-agent','PR Summarizer Agent','Summarizes pull requests for reviewers and stakeholders.','Use in Slack/Teams release channels.','placeholder','n8n','DevOps','beginner', array['gpt-5-mini','claude-haiku-4-5','gemini-2.5-flash-lite'], array['repository','release_window'], array['pr','release','summary'], 'single-agent','published'),
('bug-triage-agent','Bug Triage Agent','Classifies incoming bugs and recommends routing.','Improves issue queue hygiene.','placeholder','autogen','DevOps','intermediate', array['gpt-5-mini','claude-sonnet-4-6','gemini-2.5-flash'], array['product_area','support_tier'], array['bugs','triage','ops'], 'multi-agent','published'),
('ticket-classifier-agent','Ticket Classifier Agent','Tags and routes support tickets by intent and urgency.','Designed for helpdesk queue automation.','placeholder','n8n','Customer Support','beginner', array['gpt-5-mini','claude-haiku-4-5','gemini-2.5-flash-lite'], array['routing_policy','product_names'], array['support','classification'], 'tool-calling','published'),
('escalation-detector-agent','Escalation Detector Agent','Detects high-risk conversations that need human escalation.','Use in chat/email support pipelines.','placeholder','langchain','Customer Support','intermediate', array['gpt-5.2','claude-sonnet-4-6','gemini-2.5-flash'], array['sla_policy','escalation_teams'], array['support','escalation','safety'], 'tool-calling','published'),
('web-research-agent','Web Research Agent','Performs multi-source research with citation tracking.','Use for analyst prep and briefing docs.','placeholder','langgraph','Research','advanced', array['gpt-5.2','claude-opus-4-6','gemini-3.1-pro-preview'], array['research_topic','time_window'], array['research','analysis','citations'], 'multi-agent','published'),
('competitor-intel-agent','Competitor Intel Agent','Generates structured competitor snapshots and opportunity gaps.','For go-to-market strategy sprints.','placeholder','crewai','Research','advanced', array['gpt-5.2','claude-opus-4-6','gemini-2.5-pro'], array['our_company','competitor_list','market_segment'], array['competitive-intel','strategy'], 'multi-agent','published'),
('finance-risk-scoring-agent','Finance Risk Scoring Agent','Assesses transaction and client risk profiles with transparent scoring rationale.','Use in fraud-prevention and underwriting flows.','placeholder','langgraph','Finance','advanced', array['gpt-5.2','claude-4-sonnet','gemini-2.5-pro'], array['company_name','risk_policy','entity_type','exposure_context'], array['finance','risk','scoring','compliance'], 'tool-calling','published'),
('finance-expense-audit-agent','Finance Expense Audit Agent','Audits expense submissions for policy violations, fraud flags, and missing evidence.','Designed for AP controls and approval workflows.','placeholder','crewai','Finance','intermediate', array['gpt-5.2','claude-4-sonnet','llama-4-maverick'], array['company_name','expense_policy','submission_batch','approval_chain'], array['finance','audit','expenses','operations'], 'tool-calling','published'),
('ecommerce-product-description-agent','eCommerce Product Description Agent','Generates conversion-focused product descriptions and merchandising copy by audience.','Use for catalog launches and seasonal campaign refreshes.','placeholder','langchain','eCommerce','beginner', array['gpt-5.2','claude-4-sonnet','gemini-2.0-flash'], array['brand_name','product_catalog','audience_segment','tone_guide'], array['ecommerce','copywriting','catalog','marketing'], 'single-agent','published'),
('ecommerce-cart-recovery-agent','eCommerce Cart Recovery Agent','Creates personalized cart-recovery messages and follow-up logic across channels.','Use in lifecycle automation for abandoned checkout journeys.','placeholder','n8n','eCommerce','intermediate', array['gpt-5.2','claude-4-sonnet','gemini-2.5-flash'], array['brand_name','abandonment_rules','offer_strategy','channel_mix'], array['ecommerce','retention','cart-recovery','automation'], 'tool-calling','published')
on conflict (slug)
do update set
  title = excluded.title,
  description = excluded.description,
  notes = excluded.notes,
  framework = excluded.framework,
  industry = excluded.industry,
  complexity = excluded.complexity,
  model_compatibility = excluded.model_compatibility,
  variables = excluded.variables,
  tags = excluded.tags,
  use_case_type = excluded.use_case_type,
  status = 'published',
  updated_at = now();

update public.prompts p
set
  variables = case
    when coalesce(array_length(p.variables, 1), 0) = 0 then array['company_name','primary_goal','constraints']::text[]
    else p.variables
  end,
  system_prompt = format(
$PROMPT$
# Role
You are the %s specialist for %s teams.

## Skills
- Translate %s goals into practical agent plans
- Identify assumptions, constraints, and risks early
- Produce clear outputs that can be executed by engineers and operators
- Preserve factual consistency and cite uncertainty when needed

## Workflows
1. Intake the context for {{company_name}} and clarify the primary objective.
2. Break the task into steps tied to measurable outcomes.
3. Generate a complete response and include guardrails for quality and safety.
4. Return concise implementation-ready output in markdown.

## Examples
### Example 1
Input:
- Company: {{company_name}}
- Goal: {{primary_goal}}
- Constraints: {{constraints}}

Output:
- Objective summary
- Step-by-step workflow
- Quality checklist

### Example 2
Input:
- Current state data
- Desired KPI
- Operating constraints

Output:
- Proposed prompt strategy
- Execution checklist
- Validation criteria

## Formats
- Output format: Markdown
- Sections required: Objective, Plan, Checks
- Keep language concise, operational, and unambiguous
$PROMPT$,
    p.title,
    p.industry,
    coalesce(nullif(p.use_case_type, ''), 'workflow')
  ),
  updated_at = now()
where p.status = 'published';

delete from public.prompt_versions pv
using public.prompts p
where pv.prompt_id = p.id
  and p.status = 'published';

insert into public.prompt_versions (prompt_id, framework, content)
select
  p.id,
  fw.framework,
  case fw.framework
    when 'raw' then format(
$RAW$
%s

## Framework Builder Instructions (Raw)
- Use this prompt directly as the system message.
- Fill variables before runtime and keep placeholders out of final output.
- Preserve section order for predictable behavior.
$RAW$,
      p.system_prompt
    )
    when 'n8n' then format(
$N8N$
%s

## Framework Builder Instructions (n8n)
1. Put the Role and Skills sections in the AI node system message.
2. Map workflow variables from previous nodes into prompt placeholders.
3. Add fallback handling for missing variables.
4. Parse outputs into downstream action nodes.
$N8N$,
      p.system_prompt
    )
    when 'langchain' then format(
$LANGCHAIN$
%s

## Framework Builder Instructions (LangChain)
1. Use this as the system prompt in a ChatPromptTemplate.
2. Bind placeholders via input variables at chain invocation.
3. Add output parsing for deterministic downstream handling.
4. Capture validation failures and retry with constrained context.
$LANGCHAIN$,
      p.system_prompt
    )
    when 'langgraph' then format(
$LANGGRAPH$
%s

## Framework Builder Instructions (LangGraph)
1. Set this content in the planner/executor system prompt state.
2. Route branch decisions based on workflow checkpoints.
3. Store intermediate artifacts between graph nodes.
4. Add guard nodes to validate output schema and policy rules.
$LANGGRAPH$,
      p.system_prompt
    )
    when 'crewai' then format(
$CREWAI$
%s

## Framework Builder Instructions (CrewAI)
1. Use Role and Skills as the primary agent backstory and goals.
2. Map Workflows into task definitions and handoff order.
3. Enforce output structure with expected_output contracts.
4. Add review task for safety and completeness checks.
$CREWAI$,
      p.system_prompt
    )
    when 'autogen' then format(
$AUTOGEN$
%s

## Framework Builder Instructions (AutoGen)
1. Configure this as the lead assistant system message.
2. Pass variables into group chat context before execution.
3. Require each turn to follow the output section format.
4. Add a validator agent to check quality and policy constraints.
$AUTOGEN$,
      p.system_prompt
    )
  end
from public.prompts p
cross join (
  select unnest(array['raw','n8n','langchain','langgraph','crewai','autogen']::text[]) as framework
) fw
where p.status = 'published'
on conflict (prompt_id, framework)
do update set
  content = excluded.content;