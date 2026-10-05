import type { MetadataRoute } from "next";

const siteUrl = "https://pitlo.me";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
