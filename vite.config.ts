/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Java::Compendium',
        short_name: 'Compendium',
        description:
          'A cross-linked knowledge base spanning Java, JavaScript/TypeScript, computer science, system design, and AI/ML — distilled from foundational books into topics, knowledge graphs, and class references.',
        theme_color: '#0e1116',
        background_color: '#0e1116',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Only the hashed JS/CSS/font bundle is precached on install. Page HTML is deliberately
        // excluded, and navigateFallback is left unset (its default), so nothing is downloaded
        // offline-ready until a page has actually been visited (see runtimeCaching below) — every
        // route already has its own real prerendered HTML file, so there's no single app-shell to
        // fall back to and no reason to force-download the whole site upfront.
        globPatterns: ['assets/**/*.{js,css,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages' },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'images' },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
})
