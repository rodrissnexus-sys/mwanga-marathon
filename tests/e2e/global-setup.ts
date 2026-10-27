import fs from "node:fs";
import { accounts, admin, deleteE2eRows, deleteE2eUsers } from "./supabase";

export default async function globalSetup() {
  await deleteE2eRows();
  await deleteE2eUsers();
  for (const account of Object.values(accounts)) {
    const { status, json } = await admin("/auth/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email: account.email,
        password: account.password,
        email_confirm: true,
        app_metadata: { role: account.role },
        user_metadata: { name: `E2E ${account.role}` },
      }),
    });
    if (status >= 300) throw new Error(`could not create ${account.email}: ${JSON.stringify(json)}`);
  }
  fs.mkdirSync("test-results", { recursive: true });
}
