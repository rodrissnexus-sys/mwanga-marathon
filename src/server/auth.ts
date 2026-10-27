import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Role = Database["public"]["Enums"]["app_role"];

export class AuthError extends Error {}

/**
 * The signed-in staff member, or an AuthError. `role: "admin"` requires an
 * admin; otherwise any staff role (admin or moderator) is accepted.
 */
export async function requireStaff(role?: Role) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) throw new AuthError("Please log in again.");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (!profile) throw new AuthError("This account has no dashboard access.");
  if (role === "admin" && profile.role !== "admin") throw new AuthError("Admin access required.");

  return { supabase, profile };
}
