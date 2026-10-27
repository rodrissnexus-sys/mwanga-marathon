import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "sw"],
  defaultLocale: "en",
  // English stays at `/`, Swahili lives under `/sw`.
  localePrefix: "as-needed",
  // Visitors choose their language with the switcher; don't redirect by browser language.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
