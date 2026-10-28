import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import RegistrationStatus from "@/views/registration-status/RegistrationStatus";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await rootLocale()) as Locale, "/registration-status", "registrationStatus", "registrationStatus");
}

export default function Page() {
  return <RegistrationStatus />;
}
