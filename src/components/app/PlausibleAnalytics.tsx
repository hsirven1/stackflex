import Script from "next/script";
import { plausibleDomain } from "@/lib/integrations/analytics";

/**
 * Loads Plausible with hash-based pageviews (StackFlex uses #guide / #results).
 * Custom funnel events go through `track()` → window.plausible.
 */
export function PlausibleAnalytics() {
  const domain = plausibleDomain();
  if (!domain) return null;

  const scriptSrc =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC?.trim() ||
    "https://plausible.io/js/script.hash.outbound-links.js";

  return (
    <Script
      defer
      data-domain={domain}
      src={scriptSrc}
      strategy="afterInteractive"
    />
  );
}
