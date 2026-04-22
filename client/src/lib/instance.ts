import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import i18n from "../i18n";
import { mapBackendErrorToTranslationKey } from "./utils/errorMapper";

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: any = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});

	failedQueue = [];
};

instance.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

		// Don't intercept refresh requests themselves to avoid loops
		if (originalRequest?.url?.includes("/refresh")) {
			const errorKey = mapBackendErrorToTranslationKey(error);
			return Promise.reject(new Error(i18n.t(errorKey as any)));
		}

		if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise(function (resolve, reject) {
					failedQueue.push({ resolve, reject });
				})
					.then(() => {
						return instance(originalRequest);
					})
					.catch((err) => {
						// If it's already a localized Error, just pass it through
						if (err instanceof Error && !(err as any).isAxiosError) {
							return Promise.reject(err);
						}
						const errorKey = mapBackendErrorToTranslationKey(err);
						return Promise.reject(new Error(i18n.t(errorKey as any)));
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				// Attempt to refresh the token
				await axios.post(`${import.meta.env.VITE_API_URL}/refresh`, {}, { withCredentials: true });

				processQueue(null); // Resolve queued requests
				return instance(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null); // Reject queued requests

				// If refresh fails, redirect to login unless we're already there
				if (!window.location.pathname.includes("/login")) {
					window.location.href = "/login";
				}
				const errorKey = mapBackendErrorToTranslationKey(refreshError);
				return Promise.reject(new Error(i18n.t(errorKey as any)));
			} finally {
				isRefreshing = false;
			}
		}

		const errorKey = mapBackendErrorToTranslationKey(error);
		return Promise.reject(new Error(i18n.t(errorKey as any)));
	},
);

export default instance;
