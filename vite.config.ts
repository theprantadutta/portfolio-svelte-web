import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // Tailwind as a Vite plugin rather than through PostCSS: it handles the
    // `@import 'tailwindcss'` in app.css itself and skips the PostCSS pipeline
    // entirely, which is both faster and the supported path on Vite.
    tailwindcss(),
    // Must come before sveltekit(). Rewrites <enhanced:img> into a <picture>
    // with build-time AVIF/WebP derivatives and a full srcset — this is what
    // replaces next/image for the local photos in src/lib/assets.
    enhancedImages(),
    sveltekit(),
  ],

  build: {
    // The site is prerendered, so a slightly larger inlining threshold trades
    // a handful of requests for bytes that are already gzip/brotli'd.
    assetsInlineLimit: 2048,
    cssMinify: 'lightningcss',
  },

  server: {
    port: 5173,
  },

  preview: {
    port: 4173,
  },
})
