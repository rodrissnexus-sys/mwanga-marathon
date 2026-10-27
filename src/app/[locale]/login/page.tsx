import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import ClientOnly from "@/components/common/ClientOnly";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/views/auth/Login";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await rootLocale(), namespace: "meta" });
  return { title: t("login"), robots: { index: false } };
}

export default function LoginPage() {
  return (
    <ClientOnly>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </ClientOnly>
  );
}
