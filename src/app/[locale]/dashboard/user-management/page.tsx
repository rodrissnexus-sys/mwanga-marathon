import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserManagement from "@/views/dashboard/components/users/UserManagement";

export default function Page() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UserManagement />
    </ProtectedRoute>
  );
}
