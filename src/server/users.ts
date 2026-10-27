"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthError, requireStaff } from "./auth";

const role = z.enum(["admin", "moderator"]);
const password = z.string().min(8, "The password must be at least 8 characters.");

const createSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    email: z.email().max(255),
    password,
    password_confirmation: z.string(),
    role: role.default("moderator"),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password"],
    message: "The password confirmation does not match.",
  });

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    email: z.email().max(255).optional(),
    role: role.optional(),
    password: password.optional(),
    password_confirmation: z.string().optional(),
  })
  .refine((v) => !v.password || v.password === v.password_confirmation, {
    path: ["password"],
    message: "The password confirmation does not match.",
  });

type Result = { success: boolean; data?: unknown; message?: string; error?: string; errors?: Record<string, string[]> };

function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) (errors[String(issue.path[0] ?? "general")] ??= []).push(issue.message);
  return errors;
}

function failed(error: unknown, fallback: string): Result {
  if (error instanceof AuthError) return { success: false, error: error.message };
  console.error(`[users] ${fallback}`, error);
  const message = (error as { message?: string })?.message;
  return { success: false, error: message || fallback, errors: { general: [message || fallback] } };
}

/** Admins create staff accounts (admin or moderator). */
export async function createUser(input: z.input<typeof createSchema>): Promise<Result> {
  try {
    await requireStaff("admin");
    const parsed = createSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Validation failed", errors: fieldErrors(parsed.error) };
    const { name, email, password: pw, role: r } = parsed.data;

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: pw,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role: r },
    });
    if (error) {
      const taken = /already|registered|exists/i.test(error.message);
      return taken
        ? { success: false, error: "Validation failed", errors: { email: ["The email has already been taken."] } }
        : failed(error, "Failed to create user");
    }
    const { data: profile } = await admin.from("profiles").select("*").eq("id", data.user.id).single();
    return { success: true, data: profile, message: "User created successfully" };
  } catch (error) {
    return failed(error, "Failed to create user");
  }
}

/** Admins edit a staff member's name, email, role or password. */
export async function updateUser(id: string, input: z.input<typeof updateSchema>): Promise<Result> {
  try {
    await requireStaff("admin");
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Validation failed", errors: fieldErrors(parsed.error) };
    const { name, email, role: r, password: pw } = parsed.data;

    const admin = createAdminClient();
    if (email || pw || name) {
      const { error } = await admin.auth.admin.updateUserById(id, {
        ...(email ? { email, email_confirm: true } : {}),
        ...(pw ? { password: pw } : {}),
        ...(name ? { user_metadata: { name } } : {}),
      });
      if (error) return failed(error, "Failed to update user");
    }
    const changes = { ...(name ? { name } : {}), ...(email ? { email } : {}), ...(r ? { role: r } : {}) };
    if (Object.keys(changes).length) {
      const { error } = await admin.from("profiles").update(changes).eq("id", id);
      if (error) return failed(error, "Failed to update user");
    }
    const { data: profile } = await admin.from("profiles").select("*").eq("id", id).single();
    return { success: true, data: profile, message: "User updated successfully" };
  } catch (error) {
    return failed(error, "Failed to update user");
  }
}

/** Admins remove moderators. Admin accounts can't be deleted (as before). */
export async function deleteUser(id: string): Promise<Result> {
  try {
    const { profile: me } = await requireStaff("admin");
    const admin = createAdminClient();
    const { data: target } = await admin.from("profiles").select("role").eq("id", id).single();
    if (!target) return { success: false, error: "User not found" };
    if (target.role === "admin" || id === me.id) return { success: false, error: "Admin users cannot be deleted" };

    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return failed(error, "Failed to delete user");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    return failed(error, "Failed to delete user");
  }
}

/** Admins: staff list with login status (suspended accounts can't sign in). */
export async function listUsers(): Promise<Result> {
  try {
    await requireStaff("admin");
    const admin = createAdminClient();
    const [{ data: profiles, error }, { data: auth, error: authError }] = await Promise.all([
      admin.from("profiles").select("*").order("created_at"),
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ]);
    if (error || authError) return failed(error ?? authError, "Failed to fetch users");

    const byId = new Map(auth.users.map((u) => [u.id, u]));
    const data = (profiles ?? []).map((p) => {
      const user = byId.get(p.id);
      const suspended = user?.banned_until ? Date.parse(user.banned_until) > Date.now() : false;
      return { ...p, status: suspended ? "suspended" : "active", last_sign_in_at: user?.last_sign_in_at ?? null };
    });
    return { success: true, data };
  } catch (error) {
    return failed(error, "Failed to fetch users");
  }
}

/** Admins suspend ("suspended") or re-enable ("active") a moderator's login. */
export async function updateUserStatus(id: string, status: string): Promise<Result> {
  try {
    const { profile: me } = await requireStaff("admin");
    if (!["active", "suspended"].includes(status)) return { success: false, error: "Unknown status" };
    if (id === me.id) return { success: false, error: "You can't suspend your own account" };

    const { error } = await createAdminClient().auth.admin.updateUserById(id, {
      ban_duration: status === "suspended" ? "876000h" : "none",
    });
    if (error) return failed(error, "Failed to update user status");
    return { success: true, message: `User status updated to ${status}` };
  } catch (error) {
    return failed(error, "Failed to update user status");
  }
}
