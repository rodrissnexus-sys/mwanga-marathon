import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/metadata";
import MwafemLanding from "@/views/home/MwafemLanding";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as Locale;
  return { alternates: localizedAlternates(locale, "/") };
}

export default function HomePage() {
  return <MwafemLanding />;
}
