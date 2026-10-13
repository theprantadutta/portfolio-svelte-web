import adapter from '@sveltejs/adapter-node'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

import { SITE_URL } from './src/lib/site.ts'

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
    // SvelteKit 3 takes its configuration here; there is no svelte.config.js.
    sveltekit({
      preprocess: vitePreprocess(),

      // adapter-node, but every page carries `export const prerender = true`.
      // The build emits a static HTML file per route which the Node server
      // streams straight off disk — no rendering at request time. The server
      // exists for the few runtime endpoints (contact, reactions, heatmap,
      // CV), which need secrets or live data.
      adapter: adapter({
        out: 'build',
        precompress: true, // emit .br and .gz next to every asset
      }),

      paths: {
        // The public origin. Behind Traefik the server cannot infer it, and
        // the CSRF check compares form posts against it: without this, a
        // contact form submitted with JavaScript off is rejected with a 403.
        // Replaces adapter-node's ORIGIN environment variable, which
        // SvelteKit 3 no longer reads. Also the `url.origin` prerendering sees.
        origin: SITE_URL,
      },

      prerender: {
        // A missing prerendered page is a build failure, not a silent 404 —
        // the Next build behaved the same way for /projects/[slug].
        handleHttpError: 'fail',
        // Hash links point at sections rendered by client-only islands on some
        // routes; they are not a routing concern.
        handleMissingId: 'ignore',
      },

      // Slightly shorter than the default and stable across builds.
      appDir: '_app',

      // Inline every stylesheet into the prerendered HTML. The global sheet is
      // under 8 KB brotli and the per-page ones are smaller, so a page costs a
      // few KB more and loses its render-blocking CSS round trips, which
      // Lighthouse measured at ~330ms each on a mobile connection.
      inlineStyleThreshold: Infinity,
    }),
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
