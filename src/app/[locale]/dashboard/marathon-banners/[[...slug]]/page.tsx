import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MarathonBannerManagement from "@/views/dashboard/components/marathon/MarathonBannerManagement";

export default function Page() {
  return (
    <ProtectedRoute requiredRole="admin">
      <MarathonBannerManagement />
    </ProtectedRoute>
  );
}
