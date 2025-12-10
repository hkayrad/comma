import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

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
			return Promise.reject(error);
		}

		if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise(function (resolve, reject) {
					failedQueue.push({ resolve, reject });
				})
					.then((_token) => {
						// originalRequest.headers["Authorization"] = "Bearer " + token; // Not needed with cookies
						return instance(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				// Attempt to refresh the token
				await axios.post(
					`${import.meta.env.VITE_API_URL}/refresh`,
					{},
					{ withCredentials: true }
				);

				processQueue(null); // Resolve queued requests
				return instance(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null); // Reject queued requests

				// If refresh fails, redirect to login unless we're already there
				if (!window.location.pathname.includes("/auth/login")) {
					window.location.href = "/auth/login";
				}
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);

export default instance;
