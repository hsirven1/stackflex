import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://stackflex.app");

  return [
    { url: site, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${site}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
