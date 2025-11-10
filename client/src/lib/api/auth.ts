import Cookies from "js-cookie";
import instance from "../instance";
import { useJwt } from "react-jwt";
import type { DecodedJwtToken } from "../types";

export class AuthApi {
    static async Login(username: string, password: string) {
        try {
            const response = await instance.post('/login', { username, password });

            const { status, data } = response.data;

            if (status !== 200)
                return Promise.reject(new Error("Login failed"));

            Cookies.set('user_session', data, { expires: 1 / 24 * 8 }); // Expires in 8 hours
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(new Error("Login failed"));
        }
    }

    static async Logout() {
        try {
            Cookies.remove('user_session');
            return Promise.resolve(true);
        }
        catch (error) {
            return Promise.reject(new Error("Logout failed"));
        }
    }
}

// Custom hook to get the current user
export function useCurrentUser(): DecodedJwtToken | null {
    const token = Cookies.get('user_session');

    const { decodedToken, isExpired } = useJwt(token || '');

    if (!token || isExpired) {
        if (token && isExpired) {
            Cookies.remove('user_session');
        }
        return null;
    }

    return decodedToken as DecodedJwtToken;
}