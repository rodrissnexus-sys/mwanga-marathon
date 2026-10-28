import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import Visit from "@/views/visit/Visit";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await rootLocale()) as Locale, "/visit", "visit", "visit");
}

export default function Page() {
  return <Visit />;
}
