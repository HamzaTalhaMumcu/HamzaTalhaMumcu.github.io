import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/signup",
        "/forgot-password",
        "/update-password",
        "/dashboard",
        "/projects",
        "/projects/",
        "/feedback",
        "/auth",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: "https://pitlo.me/sitemap.xml",
  };
}
