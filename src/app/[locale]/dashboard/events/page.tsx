import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EventsView from "@/views/dashboard/components/events/EventsView";

export default function Page() {
  return (
    <ProtectedRoute requiredRole="admin">
      <EventsView />
    </ProtectedRoute>
  );
}
