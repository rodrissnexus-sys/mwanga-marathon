import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { config as faConfig } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/metadata";
import "../globals.css";

// Font Awesome's CSS is imported above; don't inject it again at runtime.
faConfig.autoAddCss = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("home.title"), template: `%s - ${t("siteName")}` },
    description: t("home.description"),
    keywords: t("home.keywords"),
    icons: {
      icon: [
        { url: "/assets/favicon/favicon.ico" },
        { url: "/assets/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/assets/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/assets/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/assets/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: { url: "/assets/favicon/apple-touch-icon.png", sizes: "180x180" },
    },
    manifest: "/assets/favicon/site.webmanifest",
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: t("home.title"),
      description: t("home.description"),
      locale: locale === "sw" ? "sw_TZ" : "en_US",
      images: [{ url: "/assets/favicon/android-chrome-512x512.png", width: 512, height: 512 }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
