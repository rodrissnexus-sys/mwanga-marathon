import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Called once a day by Vercel Cron (see vercel.json). Free Supabase projects
 * are paused after a week without database activity; this tiny read keeps
 * the project active. When CRON_SECRET is set in Vercel, only the cron job
 * (which sends it as a Bearer token) may call it.
 */
export async function GET(request: Request) {
  // reading the request also keeps the build from running this ahead of time
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const { error } = await createAdminClient()
    .from("events")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("[keep-alive] database check failed:", error.message);
    return Response.json({ ok: false }, { status: 500 });
  }
  return Response.json({ ok: true, at: new Date().toISOString() });
}
