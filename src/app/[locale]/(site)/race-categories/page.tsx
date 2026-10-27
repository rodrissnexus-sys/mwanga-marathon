import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import RaceCategories from "@/views/race_categories/RaceCategories";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await rootLocale()) as Locale, "/race-categories", "raceCategories", "raceCategories");
}

export default function Page() {
  return <RaceCategories />;
}
