import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import Sponsors from "@/views/sponsors/Sponsors";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await rootLocale()) as Locale, "/sponsors", "sponsors", "sponsors");
}

export default function Page() {
  return <Sponsors />;
}
