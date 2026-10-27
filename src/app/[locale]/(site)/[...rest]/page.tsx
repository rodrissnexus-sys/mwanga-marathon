import { notFound } from "next/navigation";

// Any unknown path inside the site renders the site's 404 page.
export default function CatchAll() {
  notFound();
}
