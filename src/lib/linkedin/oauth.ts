import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getLinkedInConfig } from "./config";

export const LI_STATE_COOKIE = "sf_li_oauth_state";
export const LI_IMPORT_COOKIE = "sf_li_import";

export type LinkedInImportPayload = {
  name: string;
  picture?: string;
  exp: number;
};

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const USERINFO_URL = "https://api.linkedin.com/v2/userinfo";

export function createOAuthState(): string {
  return randomBytes(24).toString("base64url");
}

export function linkedInAuthorizeUrl(state: string): string | null {
  const cfg = getLinkedInConfig();
  if (!cfg) return null;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    state,
    scope: "openid profile",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeLinkedInCode(code: string): Promise<{ access_token: string } | null> {
  const cfg = getLinkedInConfig();
  if (!cfg) return null;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: cfg.redirectUri,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) return null;
  return { access_token: json.access_token };
}

export async function fetchLinkedInUserInfo(accessToken: string): Promise<{ name: string; picture?: string } | null> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  };
  const name =
    json.name?.trim() ||
    [json.given_name, json.family_name].filter(Boolean).join(" ").trim();
  if (!name) return null;
  const picture = typeof json.picture === "string" && json.picture.startsWith("https://") ? json.picture : undefined;
  return { name: name.slice(0, 60), picture };
}

/** Sign a short-lived import cookie value with HMAC-SHA-256. */
export function sealImportPayload(payload: Omit<LinkedInImportPayload, "exp">, secret: string): string {
  const body: LinkedInImportPayload = { ...payload, exp: Date.now() + 10 * 60 * 1000 };
  const json = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = createHmac("sha256", secret).update(json).digest("base64url");
  return `${json}.${sig}`;
}

export function openImportPayload(sealed: string, secret: string): LinkedInImportPayload | null {
  const [json, sig] = sealed.split(".");
  if (!json || !sig) return null;
  const expected = createHmac("sha256", secret).update(json).digest("base64url");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const body = JSON.parse(Buffer.from(json, "base64url").toString("utf8")) as LinkedInImportPayload;
    if (!body?.name || typeof body.exp !== "number" || body.exp < Date.now()) return null;
    return body;
  } catch {
    return null;
  }
}

/**
 * Secret for sealing import cookies.
 * Production refuses a hardcoded fallback — LinkedIn import must be configured.
 */
export function cookieSecret(): string {
  const secret =
    process.env.LINKEDIN_CLIENT_SECRET?.trim() || process.env.STACKFLEX_OAUTH_SECRET?.trim() || "";
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("OAuth cookie secret is not configured");
  }
  return "stackflex-dev-oauth-secret";
}
