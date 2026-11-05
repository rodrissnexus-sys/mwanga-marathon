import { notFound } from "next/navigation";

// The volunteer page is hidden for now (organisers' request). To bring it back,
// restore the previous version of this file from git, plus the footer link
// in src/layouts/Footer.jsx and the entry in src/app/sitemap.ts.
export default function Page() {
  notFound();
}
