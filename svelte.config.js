import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // adapter-node, but every page carries `export const prerender = true`.
    // The build emits a static HTML file per route which the Node server
    // streams straight off disk — no rendering at request time. The server
    // exists purely for POST /api/contact, which needs the Resend key to stay
    // off the client.
    adapter: adapter({
      out: 'build',
      precompress: true, // emit .br and .gz next to every asset
    }),

    prerender: {
      // A missing prerendered page is a build failure, not a silent 404 —
      // the Next build behaved the same way for /projects/[slug].
      handleHttpError: 'fail',
      // Hash links point at sections rendered by client-only islands on some
      // routes; they are not a routing concern.
      handleMissingId: 'ignore',
    },

    alias: {
      $components: 'src/lib/components',
      $icons: 'src/lib/icons',
    },

    // Slightly shorter than the default and stable across builds.
    appDir: '_app',
  },
}

export default config
