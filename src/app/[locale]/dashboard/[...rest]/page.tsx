import { Navigate } from "@/lib/router";

// Unknown dashboard paths (e.g. the sidebar's /dashboard/settings) go back
// to the dashboard home, as before.
export default function DashboardCatchAll() {
  return <Navigate to="/dashboard" replace />;
}
