import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/integrations/rateLimit";
import { getLinkedInConfig } from "@/lib/linkedin/config";
import {
  cookieSecret,
  exchangeLinkedInCode,
  fetchLinkedInUserInfo,
  LI_IMPORT_COOKIE,
  LI_STATE_COOKIE,
  sealImportPayload,
} from "@/lib/linkedin/oauth";
import { resolveShareOrigin } from "@/lib/stack-sharing";

function appOrigin(request: Request): string {
  const { origin } = resolveShareOrigin({ origin: new URL(request.url).origin });
  return origin;
}

function errorRedirect(origin: string, returnTo: string, reason: string) {
  const dest = new URL(returnTo, origin);
  dest.searchParams.set("li", "error");
  dest.searchParams.set("li_reason", reason);
  return NextResponse.redirect(dest);
}

/** LinkedIn OAuth callback — exchanges code, stores a short-lived import cookie, returns to Results. */
export async function GET(request: Request) {
  const origin = appOrigin(request);
  if (!rateLimit(`li-callback:${clientIp(request)}`, 20, 60_000)) {
    return errorRedirect(origin, "/#results", "rate_limited");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const stateCookie = request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${LI_STATE_COOKIE}=([^;]+)`))?.[1];
  const decoded = stateCookie ? decodeURIComponent(stateCookie) : "";
  const [expectedState, returnToRaw] = decoded.split("|");
  const returnTo =
    returnToRaw && returnToRaw.startsWith("/") && !returnToRaw.startsWith("//") ? returnToRaw : "/#results";

  const clearState = (res: NextResponse) => {
    res.cookies.set(LI_STATE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  };

  if (!getLinkedInConfig()) {
    return clearState(errorRedirect(origin, returnTo, "not_configured"));
  }
  if (oauthError) {
    return clearState(errorRedirect(origin, returnTo, oauthError === "user_cancelled_login" ? "cancelled" : "denied"));
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return clearState(errorRedirect(origin, returnTo, "invalid_state"));
  }

  const token = await exchangeLinkedInCode(code);
  if (!token) {
    return clearState(errorRedirect(origin, returnTo, "token_exchange"));
  }

  const profile = await fetchLinkedInUserInfo(token.access_token);
  if (!profile) {
    return clearState(errorRedirect(origin, returnTo, "userinfo"));
  }

  // Access token is discarded here — only name/picture are sealed briefly for the editor.
  let sealed: string;
  try {
    sealed = sealImportPayload({ name: profile.name, picture: profile.picture }, cookieSecret());
  } catch {
    return clearState(errorRedirect(origin, returnTo, "not_configured"));
  }

  // Prefer /?li=import#results so the SPA hash route and query coexist.
  const res = NextResponse.redirect(`${origin}/?li=import#results`);
  clearState(res);
  res.cookies.set(LI_IMPORT_COOKIE, sealed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
