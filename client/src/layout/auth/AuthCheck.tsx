import { type JSX } from "react";
import { Navigate } from "react-router";
import Cookies from "js-cookie";

function hasUserSession(): boolean {
    return !!Cookies.get("auth_token");
}

type Props = {
    children: JSX.Element
}

export function RequireAuth({ children }: Props): React.ReactNode {
    if (!hasUserSession()) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export function RequireNoAuth({ children }: Props): React.ReactNode {
    if (hasUserSession()) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}