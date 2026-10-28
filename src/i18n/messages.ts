import type { Locale } from "./routing";

// One JSON file per namespace in messages/<locale>/; add new namespaces here.
const NAMESPACES = ["header", "footer", "hero", "meta", "home", "about", "sponsors", "forms", "events", "raceCategories", "register", "common", "contact"] as const;

export async function loadMessages(locale: Locale) {
  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => [
      ns,
      (await import(`../../messages/${locale}/${ns}.json`)).default,
    ]),
  );
  return Object.fromEntries(entries);
}
