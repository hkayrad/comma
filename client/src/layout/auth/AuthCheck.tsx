import { type JSX } from "react";
import { Navigate } from "react-router";
import Cookies from "js-cookie";

function hasUserSession(): boolean {
    const token = Cookies.get('user_session');

    if (!token) return false;

    return true;
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