import Cookies from "js-cookie";
import instance from "../instance";
import { useJwt } from "react-jwt";

type Token = {
    aud: string,
    exp: number,
    iat: number,
    id: string,
    iss: string,
    username: string
}

export class Auth {
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


    static GetCurrentUser(): Token | null {
        const token = Cookies.get('user_session');

        if (!token) return null;

        const { decodedToken, isExpired } = useJwt(token);

        if (isExpired) {
            Cookies.remove('user_session');
            return null;
        }

        return decodedToken as Token;
    }
}