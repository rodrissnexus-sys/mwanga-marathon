import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StaffView from "@/views/dashboard/components/users/StaffView";

export default function Page() {
  return (
    <ProtectedRoute requiredRole="admin">
      <StaffView />
    </ProtectedRoute>
  );
}
