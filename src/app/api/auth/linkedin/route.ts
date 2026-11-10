import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/integrations/rateLimit";
import { getLinkedInConfig } from "@/lib/linkedin/config";
import { createOAuthState, LI_STATE_COOKIE, linkedInAuthorizeUrl } from "@/lib/linkedin/oauth";

/** Start LinkedIn OpenID Connect — gated when credentials are missing. */
export async function GET(request: Request) {
  if (!rateLimit(`li-start:${clientIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!getLinkedInConfig()) {
    return NextResponse.json(
      { error: "LinkedIn import is not configured on this deployment." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const returnTo = url.searchParams.get("return") || "/#results";
  // Only allow same-origin relative returns.
  const safeReturn = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/#results";

  const state = createOAuthState();
  const authorize = linkedInAuthorizeUrl(state);
  if (!authorize) {
    return NextResponse.json({ error: "LinkedIn import is not configured." }, { status: 503 });
  }

  const res = NextResponse.redirect(authorize);
  res.cookies.set(LI_STATE_COOKIE, `${state}|${safeReturn}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
