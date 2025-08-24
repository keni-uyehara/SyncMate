import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Change the backend port/URL here if needed.
// You can also set VITE_API_TARGET in your env (.env, .env.local, etc.)
const API_TARGET = process.env.VITE_API_TARGET || "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Forward all /api requests from Vite (5173) to your Express API (e.g., 4000)
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        // If your backend uses cookies/sessions and you want them preserved:
        // configure: (proxy) => {
        //   proxy.on("proxyReq", (proxyReq) => {
        //     proxyReq.setHeader("Origin", API_TARGET);
        //   });
        // },
      },
    },
  },
  // Optional: build options (safe defaults)
  build: {
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
  },
});
