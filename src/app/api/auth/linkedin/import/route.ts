import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/integrations/rateLimit";
import { cookieSecret, LI_IMPORT_COOKIE, openImportPayload } from "@/lib/linkedin/oauth";

function clearImportCookie(res: NextResponse) {
  res.cookies.set(LI_IMPORT_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Read and clear a pending LinkedIn import payload (one-shot). Never returns access tokens. */
export async function GET(request: Request) {
  if (!rateLimit(`li-import:${clientIp(request)}`, 30, 60_000)) {
    return NextResponse.json({ ok: false as const, import: null }, { status: 429 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${LI_IMPORT_COOKIE}=([^;]+)`));
  const raw = match?.[1];

  if (!raw) {
    return NextResponse.json({ ok: false as const, import: null });
  }

  let secret: string;
  try {
    secret = cookieSecret();
  } catch {
    const res = NextResponse.json({ ok: false as const, import: null, error: "expired" });
    clearImportCookie(res);
    return res;
  }

  const payload = openImportPayload(decodeURIComponent(raw), secret);
  if (!payload) {
    const res = NextResponse.json({ ok: false as const, import: null, error: "expired" });
    clearImportCookie(res);
    return res;
  }

  const res = NextResponse.json({
    ok: true as const,
    import: {
      name: payload.name,
      picture: payload.picture ?? null,
    },
  });
  clearImportCookie(res);
  return res;
}
