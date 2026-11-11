import type { AuthInfo } from "@modelcontextprotocol/server";

/**
 * Single-user / development bearer auth for the MCP portfolio endpoint.
 *
 * Production public launch requires replacing this with real OAuth (user accounts)
 * and draft ownership checks. See docs/MCP.md.
 */
export function mcpPortfolioToken(): string {
  return process.env.MCP_PORTFOLIO_TOKEN?.trim() || "";
}

export function mcpAuthConfigured(): boolean {
  return Boolean(mcpPortfolioToken());
}

export async function verifyMcpPortfolioToken(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  const expected = mcpPortfolioToken();
  if (!expected || !bearerToken) return undefined;

  // Constant-time-ish compare for equal-length secrets.
  if (bearerToken.length !== expected.length) return undefined;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= bearerToken.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) return undefined;

  return {
    token: bearerToken,
    clientId: "stackflex-single-user",
    scopes: ["portfolio:draft"],
    // Far-future expiry for static shared secret mode.
    expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  };
}
