import { type JSX } from "react";
import { Navigate } from "react-router";
import { useUser } from "@/contexts/user";

type Props = {
  children: JSX.Element;
};

export function RequireAuth({ children }: Props): React.ReactNode {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function RequireNoAuth({ children }: Props): React.ReactNode {
  const { user } = useUser();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
