/**
 * Guided prompt for ChatGPT / Claude. Users copy this verbatim — no placeholders to fill.
 * Instructs the assistant to emit stackflex-ai-activity-v1 JSON only.
 */
export const EXTRACTION_PROMPT = `You are helping me prepare an AI activity report for StackFlex, a personal AI portfolio tool.

Goal: Identify concrete things I have actually done with AI — projects, workflows, deliverables, automations, creative outputs, and analyses — based only on information you can access (this conversation, memory you already have about me, or files I have shared with you in this chat).

Important limits:
- You may NOT have access to my full chat history. Only use what you can actually see or recall.
- Do NOT invent projects, metrics, clients, outcomes, or skills.
- Do NOT include passwords, private client names, confidential documents, secrets, or other sensitive raw content.
- Separate completed work, work in progress, and ideas that were only discussed (planned).
- Prefer concrete deliverables over vague "I use AI for X" statements.
- Mark evidence honestly: observed (from concrete artifacts or clear past work), self_reported (I told you), or inferred (reasonable guess — use sparingly).
- Outcomes only if genuinely supported; otherwise omit them.
- Tools and capabilities only when supported by the work.

Return STRICTLY valid JSON. No markdown fences, no commentary before or after the JSON.

Schema (stackflex-ai-activity-v1):
{
  "format": "stackflex-ai-activity-v1",
  "provider": "chatgpt" | "claude" | "other",
  "generatedAt": "ISO-8601 timestamp if known",
  "scope": {
    "limitations": "One or two sentences on what you could and could not access"
  },
  "projects": [
    {
      "title": "Short title",
      "description": "1–3 sentences on what I did with AI",
      "type": "project" | "workflow" | "deliverable" | "automation" | "analysis" | "creative" | "other",
      "status": "completed" | "in_progress" | "planned",
      "tools": ["Tool names as strings"],
      "capabilities": ["e.g. Research", "Prototyping", "Content Creation"],
      "outcome": "Optional; only if supported",
      "link": "Optional URL",
      "evidence": "observed" | "self_reported" | "inferred"
    }
  ]
}

Rules for projects:
- Include 0–12 items. Quality over quantity.
- Skip planned ideas unless they are clearly intentional and labeled status "planned".
- Prefer completed and credible in-progress work.
- Keep descriptions concise (under ~400 characters).

If you cannot find any concrete AI-assisted work, return the same schema with "projects": [] and explain the limitation in scope.limitations.`;

export const CHATGPT_URL = "https://chatgpt.com/";
export const CLAUDE_URL = "https://claude.ai/new";
