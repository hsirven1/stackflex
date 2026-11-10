/** LinkedIn OpenID Connect settings. Import UI is gated until these are present. */
export type LinkedInConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function getLinkedInConfig(env: NodeJS.ProcessEnv = process.env): LinkedInConfig | null {
  const clientId = env.LINKEDIN_CLIENT_ID?.trim();
  const clientSecret = env.LINKEDIN_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  const explicit = env.LINKEDIN_REDIRECT_URI?.trim();
  if (explicit) return { clientId, clientSecret, redirectUri: explicit };

  const site =
    env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "");
  if (!site) return null;
  const origin = /^https?:\/\//i.test(site) ? site.replace(/\/+$/, "") : `https://${site.replace(/\/+$/, "")}`;
  return {
    clientId,
    clientSecret,
    redirectUri: `${origin}/api/auth/linkedin/callback`,
  };
}

export function linkedInConfigured(): boolean {
  return getLinkedInConfig() !== null;
}
