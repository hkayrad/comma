import { Navigate, Outlet } from "react-router";
import { useUser } from "@/stores/useUserStore";
import { useQuery } from "@tanstack/react-query";
import { PortalApi } from "@/lib/api/portal";

export function RequireAuth(): React.ReactNode {
  const user = useUser((s) => s.user);
  const isLoading = useUser((s) => s.isLoading);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function RequireNoAuth(): React.ReactNode {
  const user = useUser((s) => s.user);
  const isLoading = useUser((s) => s.isLoading);

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function PortalAuthGuard(): React.ReactNode {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal", "overview"],
    queryFn: () => PortalApi.getOverview(),
    retry: false,
  });

  if (isLoading) return null;

  if (isError || !data?.success) {
    return <Navigate to="/p/invalid" replace />; // Redirect to an invalid page or prompt re-login
  }

  return <Outlet />;
}
