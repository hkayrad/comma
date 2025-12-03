/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PACKAGE_VERSION: string;
	readonly VITE_AUTHOR_NAME: string;
	readonly VITE_AUTHOR_URL: string;
	readonly VITE_API_URL: string;
	readonly VITE_WEBSOCKET_URL: string;
	readonly VITE_JWT_SECRET: string;
	readonly VITE_JWT_EXPIRES_IN: string;
	readonly VITE_JWT_ISSUER: string;
	readonly VITE_JWT_AUDIENCE: string;
	readonly VITE_NODE_ENV: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
