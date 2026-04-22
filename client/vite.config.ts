import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import packageJson from "./package.json";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		define: {
			__APP_ENV__: JSON.stringify(env.APP_ENV),
			"import.meta.env.VITE_PACKAGE_VERSION": JSON.stringify(packageJson.version),
			"import.meta.env.VITE_AUTHOR_NAME": JSON.stringify(packageJson.author.name),
			"import.meta.env.VITE_AUTHOR_URL": JSON.stringify(packageJson.author.url),
		},
		plugins: [react(), tailwindcss()],
		server: {
			host: true,
			port: 4000,
		},
		preview: {
			host: true,
			port: 4000,
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
				"@common": path.resolve(__dirname, "../common/src"),
				react: path.resolve(__dirname, "./node_modules/react"),
				"react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
			},
		},
	};
});
