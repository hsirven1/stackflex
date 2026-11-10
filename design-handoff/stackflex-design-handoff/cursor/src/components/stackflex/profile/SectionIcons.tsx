// Section icons for "AI Apps" (purple) and "AI-Powered Software" (blue).
// PLACEHOLDERS drawn to match the approved mock. If your app already has its own purple/blue icons,
// swap them in here; every component imports icons only from this file.
// Static SVG copies: public/stackflex/icons/ai-apps.svg, ai-software.svg

export function AiAppsIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden>
      <defs>
        <linearGradient id="sf-ic-apps" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7A6BFF" />
          <stop offset="1" stopColor="#3A2EFF" />
        </linearGradient>
      </defs>
      <rect width="22" height="22" rx="6.6" fill="url(#sf-ic-apps)" />
      <path d="M11 5.2l1.35 3.9 3.9 1.35-3.9 1.35L11 15.7l-1.35-3.9-3.9-1.35 3.9-1.35z" fill="#FFFFFF" />
    </svg>
  );
}

export function AiSoftwareIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden>
      <defs>
        <linearGradient id="sf-ic-soft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5AA8FF" />
          <stop offset="1" stopColor="#2D6BFF" />
        </linearGradient>
      </defs>
      <rect width="22" height="22" rx="6.6" fill="url(#sf-ic-soft)" />
      <rect x="5.5" y="6.4" width="11" height="9.2" rx="2" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
      <rect x="5.5" y="6.4" width="11" height="2.6" rx="1.2" fill="#FFFFFF" />
    </svg>
  );
}
