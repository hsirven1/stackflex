import { PORTFOLIO_IMPORT_FORMAT, type AssistantProvider } from "./types";

export const CHATGPT_URL = "https://chatgpt.com/";
export const CLAUDE_URL = "https://claude.ai/new";

export const EXTRACTION_PROMPT_VERSION = "stackflex-portfolio-import-prompt-v1";

/**
 * Self-contained extraction prompt for ChatGPT / Claude.
 * No placeholders — copy and paste as-is.
 */
export const EXTRACTION_PROMPT = `You are helping me prepare an evidence-based AI work portfolio.

Your task is to identify meaningful projects, workflows, automations, creative work, analyses, and deliverables that I have actually worked on using AI.

Use only information you can legitimately access, such as this conversation, accessible prior conversations, relevant memory context, and files I have explicitly shared.

If you have tools for retrieving past conversations, use them when available and relevant.

Do not assume you can access my complete history.

Focus on what I have DONE, not just ideas I have discussed.

For each meaningful project, extract:

1. Project name.
2. Short description of what was built or accomplished.
3. My actual contribution or role, if known.
4. How AI was used.
5. Specific AI tools used, only when supported.
6. Capabilities demonstrated by the work.
7. Current project status.
8. Concrete outcomes or measurable results, only if supported.
9. Evidence basis and source limitations.
10. Details requiring my confirmation.

Strict requirements:

- Never invent projects, accomplishments, tools, metrics, clients or links.
- Do not assume an idea was implemented just because it was discussed.
- Do not infer competence or mastery merely from mentioning a tool.
- Prefer completed work and meaningful work in progress.
- Exclude vague ideas and speculative projects from the main results.
- Do not reveal sensitive personal details, confidential business information, credentials or private client data.
- Use generic descriptions when a specific detail might be confidential.
- If a claim is uncertain, mark it as needing confirmation.
- Distinguish directly referenced artifacts from conversations, remembered summaries and self-reported claims.
- Do not describe information as independently verified unless the supporting material actually justifies that statement.
- Keep descriptions short, clear, factual and professional.
- Return a maximum of eight meaningful items, prioritizing quality over quantity.
- If no meaningful work is found, return an empty array.
- Explicitly report limitations in what information you could access.

Return valid JSON only (no markdown fences, no commentary) following this StackFlex schema:

{
  "format": "${PORTFOLIO_IMPORT_FORMAT}",
  "provider": "chatgpt" | "claude" | "other",
  "scope": {
    "contextsUsed": ["short phrases naming the kinds of context you used"],
    "inaccessible": ["short phrases naming what you could not access"],
    "limitations": "One or two sentences on important access limits"
  },
  "projects": [
    {
      "title": "Short project name",
      "summary": "1–3 sentences on what was built or accomplished",
      "type": "project" | "workflow" | "deliverable" | "automation" | "analysis" | "creative" | "other",
      "status": "completed" | "in_progress" | "planned",
      "myContribution": "What I personally did, or null if unknown",
      "aiUse": "How AI was used, or null if unknown",
      "tools": ["Only tools clearly supported by the work"],
      "capabilities": ["Capabilities demonstrated by this work"],
      "outcome": "Concrete result if supported, otherwise null",
      "evidence": {
        "kind": "referenced_artifact" | "discussed_in_conversation" | "remembered_context" | "user_reported",
        "note": "Short note on the evidence basis, or null",
        "sourceUrl": "Only a real URL you can access; otherwise null"
      },
      "needsReview": ["Specific details that need my confirmation"]
    }
  ]
}

Do not invent example projects. If nothing qualifies, return "projects": [].`;

/** Ask the assistant to reformat a previous answer without inventing new claims. */
export const FORMAT_FIX_PROMPT = `Please reformat your previous response as valid JSON only, using the StackFlex schema format "${PORTFOLIO_IMPORT_FORMAT}".

Rules:
- Do not add new projects, tools, metrics, clients, links, or accomplishments.
- Do not upgrade uncertain claims into confirmed facts.
- Keep evidence kinds honest.
- If a field is unknown, use null or an empty array as appropriate.
- Return JSON only — no markdown fences and no commentary.`;

export function assistantLabel(provider: AssistantProvider): string {
  return provider === "chatgpt" ? "ChatGPT" : "Claude";
}

export function assistantOpenUrl(provider: AssistantProvider): string {
  return provider === "chatgpt" ? CHATGPT_URL : CLAUDE_URL;
}
