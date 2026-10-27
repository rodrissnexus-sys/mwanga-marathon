import { deleteE2eRows, deleteE2eUsers } from "./supabase";

export default async function globalTeardown() {
  await deleteE2eRows();
  await deleteE2eUsers();
}
