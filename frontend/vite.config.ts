import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const apiProxy = {
  "/api": {
    target: "http://localhost:8000",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ""),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: apiProxy,
  },
  preview: {
    port: 8080,
    strictPort: true,
    proxy: apiProxy,
  },
})
