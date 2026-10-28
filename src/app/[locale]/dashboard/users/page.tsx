import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UsersView from "@/views/dashboard/components/users/UsersView";

export default function Page() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UsersView />
    </ProtectedRoute>
  );
}
