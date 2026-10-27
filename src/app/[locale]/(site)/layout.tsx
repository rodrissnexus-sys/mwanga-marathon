import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";
import BackToTop from "@/components/common/BackToTop";
import ScrollToTop from "@/components/common/ScrollToTop";

export default function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <ScrollToTop />
      <Header />
      <main className="flex-grow w-full">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
