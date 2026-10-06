import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Empty prefix so non-VITE_ variables set by docker compose are readable
  const env = loadEnv(mode, ".", "")

  const apiProxy = {
    "/api": {
      target: env.API_PROXY_TARGET ?? "http://localhost:8000",
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ""),
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 5173,
      strictPort: false,
      proxy: apiProxy,
      watch: {
        usePolling: env.WATCH_USE_POLLING === "true",
      },
    },
  }
})
