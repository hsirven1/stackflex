import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandler,
} from "mcp-handler";
import { siteOrigin } from "@/lib/mcp/draft-token";

/**
 * RFC 9728 protected-resource metadata for MCP clients.
 *
 * Single-user bearer-token mode does not yet run a full OAuth authorization server.
 * Clients that support static bearer tokens can still authenticate with MCP_PORTFOLIO_TOKEN.
 * See docs/MCP.md for public-launch requirements (CIMD / user OAuth).
 */
const origin = siteOrigin();

const handler = protectedResourceHandler({
  // Placeholder issuer until a real authorization server is wired.
  authServerUrls: [origin],
  resourceUrl: `${origin}/api/mcp`,
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
