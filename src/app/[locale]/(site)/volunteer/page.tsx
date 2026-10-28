import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import Volunteer from "@/views/volunteer/Volunteer";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await rootLocale()) as Locale, "/volunteer", "volunteer", "volunteer");
}

export default function Page() {
  return <Volunteer />;
}
