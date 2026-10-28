import { Navigate } from "@/lib/router";

// Old address of the staff page.
export default function Page() {
  return <Navigate to="/dashboard/users" replace />;
}
