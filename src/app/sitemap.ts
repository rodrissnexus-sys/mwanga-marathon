import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/metadata";

const PAGES = [
  { href: "/", priority: 1, changeFrequency: "weekly" },
  { href: "/about", priority: 0.8, changeFrequency: "monthly" },
  { href: "/race-categories", priority: 0.8, changeFrequency: "monthly" },
  { href: "/events", priority: 0.8, changeFrequency: "weekly" },
  { href: "/register", priority: 0.9, changeFrequency: "weekly" },
  { href: "/sponsors", priority: 0.7, changeFrequency: "monthly" },
  { href: "/race-day", priority: 0.8, changeFrequency: "weekly" },
  { href: "/visit", priority: 0.6, changeFrequency: "monthly" },
  { href: "/volunteer", priority: 0.6, changeFrequency: "monthly" },
  { href: "/registration-status", priority: 0.5, changeFrequency: "yearly" },
  { href: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { href: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { href: "/terms", priority: 0.3, changeFrequency: "yearly" },
] as const;

const url = (locale: (typeof routing.locales)[number], href: string) =>
  SITE_URL + getPathname({ locale, href });

// Every page in both languages, each listing its other-language version.
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ href, priority, changeFrequency }) =>
    routing.locales.map((locale) => ({
      url: url(locale, href),
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, url(l, href)])),
      },
    })),
  );
}
