import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { mcpAuthConfigured, verifyMcpPortfolioToken } from "@/lib/mcp/auth";
import {
  createDraftFromInput,
  encodeDraftToken,
  reviewUrlForToken,
  siteOrigin,
} from "@/lib/mcp/draft-token";
import {
  createPortfolioDraftInputSchema,
  MAX_MCP_PAYLOAD_CHARS,
} from "@/lib/mcp/portfolio-schema";

// cacheComponents forbids route-segment `dynamic` / `runtime` exports.
export const maxDuration = 60;

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "create_portfolio_draft",
      {
        title: "Create StackFlex portfolio draft",
        description:
          "Create a private StackFlex AI portfolio draft from structured project evidence. " +
          "Use only work the user actually completed with AI, based on information you can legitimately access. " +
          "Never invent projects, metrics, repositories, clients, or URLs. " +
          "Returns a private review URL — drafts are never published automatically.",
        inputSchema: createPortfolioDraftInputSchema,
      },
      async (input) => {
        if (!mcpAuthConfigured()) {
          return {
            content: [
              {
                type: "text",
                text: "MCP portfolio drafting is not configured. Set MCP_PORTFOLIO_TOKEN and MCP_DRAFT_SECRET.",
              },
            ],
            isError: true,
          };
        }

        const serialized = JSON.stringify(input);
        if (serialized.length > MAX_MCP_PAYLOAD_CHARS) {
          return {
            content: [
              {
                type: "text",
                text: `Payload too large (${serialized.length} chars). Keep at most 8 concise projects.`,
              },
            ],
            isError: true,
          };
        }

        const parsed = createPortfolioDraftInputSchema.safeParse(input);
        if (!parsed.success) {
          return {
            content: [
              {
                type: "text",
                text: `Invalid portfolio draft: ${parsed.error.issues
                  .slice(0, 5)
                  .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
                  .join("; ")}`,
              },
            ],
            isError: true,
          };
        }

        try {
          const draft = createDraftFromInput(parsed.data);
          const token = encodeDraftToken(draft);
          const reviewUrl = reviewUrlForToken(token);

          // Never log project content or conversation material.
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    ok: true,
                    draftId: draft.id,
                    projectCount: draft.projects.length,
                    published: false,
                    reviewUrl,
                    message:
                      "Private draft created. Open the review URL to edit projects. Nothing is published until the user confirms.",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Draft creation failed";
          return {
            content: [{ type: "text", text: message }],
            isError: true,
          };
        }
      },
    );
  },
  {
    serverInfo: {
      name: "stackflex-portfolio",
      version: "0.1.0",
    },
  },
);

const authHandler = withMcpAuth(mcpHandler, verifyMcpPortfolioToken, {
  required: true,
  requiredScopes: ["portfolio:draft"],
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
  resourceUrl: `${siteOrigin()}/api/mcp`,
});

async function guarded(req: Request): Promise<Response> {
  if (!mcpAuthConfigured()) {
    return Response.json(
      {
        error: "mcp_not_configured",
        message:
          "Set MCP_PORTFOLIO_TOKEN (and MCP_DRAFT_SECRET in production) to enable the portfolio MCP endpoint.",
      },
      { status: 503 },
    );
  }
  return authHandler(req);
}

export { guarded as GET, guarded as POST, guarded as DELETE };
