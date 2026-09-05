import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import packageJson from "./package.json";
import { VitePWA } from "vite-plugin-pwa";

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
		plugins: [
			react(),
			tailwindcss(),
			VitePWA({
				registerType: "autoUpdate",
				injectRegister: "auto",
				includeAssets: [
					"favicon.ico",
					"favicon-16x16.png",
					"favicon-32x32.png",
					"apple-touch-icon.png",
					"pwa-192x192.png",
					"pwa-512x512.png",
					"pwa-maskable-192x192.png",
					"pwa-maskable-512x512.png",
					"icon.webp",
					"logo.webp",
					"robots.txt",
				],
				manifest: {
					name: "Comma",
					short_name: "Comma",
					description: "Comma - Muhasebe ve Finans Yönetimi",
					start_url: "/",
					scope: "/",
					id: "/",
					display: "standalone",
					display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
					background_color: "#ffffff",
					theme_color: "#ffffff",
					orientation: "any",
					categories: ["business", "finance", "productivity"],
					icons: [
						{
							src: "/favicon-16x16.png",
							sizes: "16x16",
							type: "image/png",
						},
						{
							src: "/favicon-32x32.png",
							sizes: "32x32",
							type: "image/png",
						},
						{
							src: "/pwa-192x192.png",
							sizes: "192x192",
							type: "image/png",
							purpose: "any",
						},
						{
							src: "/pwa-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "any",
						},
						{
							src: "/pwa-maskable-192x192.png",
							sizes: "192x192",
							type: "image/png",
							purpose: "maskable",
						},
						{
							src: "/pwa-maskable-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "maskable",
						},
					],
					shortcuts: [
						{
							name: "Alacaklar",
							short_name: "Alacaklar",
							description: "Alacak Bilgileri ve Ödemeler",
							url: "/alacaklar",
							icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
						},
						{
							name: "Borçlar",
							short_name: "Borçlar",
							description: "Borç Bilgileri ve Ödemeler",
							url: "/borclar",
							icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
						},
						{
							name: "Çalışanlar",
							short_name: "Çalışanlar",
							description: "Çalışanlar ve Bordro",
							url: "/calisanlar",
							icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
						},
					],
				},
				workbox: {
					globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
					navigateFallback: "/index.html",
					navigateFallbackDenylist: [/^\/api/],
					runtimeCaching: [
						{
							urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
							handler: "CacheFirst",
							options: {
								cacheName: "google-fonts-cache",
								expiration: {
									maxEntries: 10,
									maxAgeSeconds: 60 * 60 * 24 * 365,
								},
								cacheableResponse: {
									statuses: [0, 200],
								},
							},
						},
						{
							urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
							handler: "CacheFirst",
							options: {
								cacheName: "gstatic-fonts-cache",
								expiration: {
									maxEntries: 10,
									maxAgeSeconds: 60 * 60 * 24 * 365,
								},
								cacheableResponse: {
									statuses: [0, 200],
								},
							},
						},
					],
				},
			}),
		],
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
			},
		},
	};
});
