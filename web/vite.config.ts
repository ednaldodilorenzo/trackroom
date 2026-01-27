// vite.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import million from "million/compiler";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [million.vite({}), react(), tailwindcss(), VitePWA({
    registerType: "autoUpdate",
    strategies: "generateSW",
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg", "offline.html"],
    manifest: {
      name: "TrackRoom",
      short_name: "TrackRoom",
      start_url: "/",
      display: "standalone",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      icons: [
        { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },

    workbox: {
      // React Router SPA navigation fallback
      navigateFallback: "/index.html",
      navigateFallbackDenylist: [
        /^\/api\//,
        /^\/assets\//,
        /\/[^/?]+\.[^/]+$/, // has a file extension
      ],

      runtimeCaching: [
        // Cache API responses (adjust /api/ to match your app)
        {
          urlPattern: /^\/api\/.*$/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "api",
            cacheableResponse: { statuses: [0, 200] },
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
          },
        },

        // Images
        {
          urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },

        // Fonts
        {
          urlPattern: /\.(woff2?|ttf|otf)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "fonts",
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
      ],
    },
  })],
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
