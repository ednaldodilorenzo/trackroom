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
      name: "TranckRoom",
      short_name: "TranckRoom",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      icons: [
        { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ],
    },

    workbox: {
      // React Router / SPA offline navigation
      navigateFallback: "/index.html",

      // When offline and a navigation can't be fulfilled, show offline page:
      navigateFallbackDenylist: [
        // Don't apply SPA fallback to APIs and assets
        /^\/api\//,
        /^\/assets\//,
        /\/[^/?]+\.[^/]+$/, // paths containing a "file.ext"
      ],

      // Offline fallback for document navigations
      offlineGoogleAnalytics: false,
      runtimeCaching: [
        // 1) HTML/doc navigations (app shell)
        {
          urlPattern: ({ request }) => request.mode === "navigate",
          handler: "NetworkFirst",
          options: {
            cacheName: "pages",
            networkTimeoutSeconds: 3,
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            // If both network and cache miss, serve offline.html
            fallbackURL: "/offline.html",
          } as any,
        },

        // 2) Static assets (JS/CSS/worker) – Cache-first
        {
          urlPattern: ({ request }) =>
            request.destination === "script" ||
            request.destination === "style" ||
            request.destination === "worker",
          handler: "CacheFirst",
          options: {
            cacheName: "assets",
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },

        // 3) Images – Cache-first
        {
          urlPattern: ({ request }) => request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },

        // 4) Fonts – Cache-first
        {
          urlPattern: ({ request }) => request.destination === "font",
          handler: "CacheFirst",
          options: {
            cacheName: "fonts",
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },

        // 5) API calls – Stale-While-Revalidate (fast + works offline with cached data)
        // Change /api/ to match your backend path, or use a domain check.
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "api",
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
            cacheableResponse: { statuses: [0, 200] },
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
