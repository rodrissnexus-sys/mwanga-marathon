import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mwafem.com";

// Canonical URL plus hreflang links for both languages of the same page.
export function localizedAlternates(locale: Locale, href: string): Metadata["alternates"] {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ locale: l, href })]),
  );
  return {
    canonical: getPathname({ locale, href }),
    languages: { ...languages, "x-default": getPathname({ locale: routing.defaultLocale, href }) },
  };
}

// Metadata for a public page whose description comes from its hero block.
export async function pageMetadata(
  locale: Locale,
  href: string,
  titleKey: string,
  heroKey?: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const hero = heroKey ? await getTranslations({ locale, namespace: "hero" }) : null;
  return {
    title: t(titleKey),
    description: hero ? hero(`${heroKey}.description`) : undefined,
    alternates: localizedAlternates(locale, href),
  };
}
