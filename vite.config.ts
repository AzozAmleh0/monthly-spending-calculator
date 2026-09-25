import path from "node:path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// Served from https://<user>.github.io/monthly-spending-calculator/
const BASE = "/monthly-spending-calculator/"

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/favicon-32.png", "icons/favicon-64.png", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Monthly Spending Calculator",
        short_name: "Spending",
        description: "Work out what your recurring expenses cost you each month.",
        lang: "en",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: BASE,
        scope: BASE,
        background_color: "#ffffff",
        theme_color: "#171717",
        icons: [
          {
            src: `${BASE}icons/icon-192.png`,
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: `${BASE}icons/icon-512.png`,
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: `${BASE}icons/icon-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff,woff2}"],
        navigateFallback: `${BASE}index.html`,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
