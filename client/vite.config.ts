import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [react(), tailwindcss()],
    server: {
      host: env.NODE_ENV === "production" ? "https://io.orhandogan.com.tr" : "localhost",
      port: env.NODE_ENV === "production" ? 443 : 4000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
