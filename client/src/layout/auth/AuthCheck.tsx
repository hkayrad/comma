import { Navigate, Outlet } from "react-router";
import { useUser } from "@/contexts/user";

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
