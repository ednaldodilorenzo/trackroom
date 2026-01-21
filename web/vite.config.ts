// vite.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import million from "million/compiler";
import tailwindcss from "@tailwindcss/vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [million.vite({}), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  server: {
    proxy: {
      // proxy /api requests to http://localhost:8080
      "/api": {
        target: "http://app:8080",
        changeOrigin: false,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom", // simulate browser environment
    setupFiles: "./src/setupTests.ts", // setup file (see next step)
  },
});
