import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://stackflex.app");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dev/", "/api/", "/portfolio/", "/portfolio/build", "/portfolio/preview"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
