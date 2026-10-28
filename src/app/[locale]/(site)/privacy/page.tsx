import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import Legal from "@/views/legal/Legal";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await rootLocale()) as Locale, "/privacy", "privacy");
}

export default function Page() {
  return <Legal doc="privacy" />;
}
