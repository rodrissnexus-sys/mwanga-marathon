import PageTransition from "@/components/common/PageTransition";

// Re-mounts on every navigation, so each page gets the enter animation.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
