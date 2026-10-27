import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import DashboardShell from "@/views/dashboard/DashboardShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await rootLocale(), namespace: "meta" });
  return { title: t("dashboard"), robots: { index: false } };
}

export default function DashboardRootLayout({ children }: LayoutProps<"/[locale]/dashboard">) {
  return <DashboardShell>{children}</DashboardShell>;
}
