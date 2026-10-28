import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import RaceDay from "@/views/race-day/RaceDay";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await rootLocale()) as Locale, "/race-day", "raceDay", "raceDay");
}

export default function Page() {
  return <RaceDay />;
}
