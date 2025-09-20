import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
})

instance.interceptors.request.use((config) => {
    const token = Cookies.get('user_session');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    } else {
        delete config.headers['Authorization'];
    }
    return config;
})

export default instance;