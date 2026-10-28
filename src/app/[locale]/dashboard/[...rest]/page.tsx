import { Navigate } from "@/lib/router";

// Unknown dashboard paths go back to the overview.
export default function DashboardCatchAll() {
  return <Navigate to="/dashboard" replace />;
}
