# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development
bun dev                       # Start the dev server on :5173
bun clean                     # Remove .svelte-kit and build

# Building and Production
bun run build                 # Build for production (prebuild cleans)
bun run preview               # Preview the production build on :4173
bun start                     # Run the built Node server (build/index.js)

# Code Quality
bun run lint                  # Run ESLint
bun run check                 # svelte-check (types + a11y + unused CSS)
bun format                    # Check formatting with Prettier
bun format:fix                # Fix formatting with Prettier
```

Note: `bun run build`/`bun run lint` (not bare `bun build`/`bun lint`) — `bun build`
is Bun's own bundler and will not invoke the package script.

## Project Architecture

A SvelteKit 2 / Svelte 5 portfolio site. Ported from Next.js 16 (the previous
implementation still lives in `../portfolio-nextjs-web`); the visual design is
unchanged, the rendering model is not.

### The core decision: everything is prerendered

`src/routes/+layout.ts` sets `prerender = true` for the whole route tree. The
build writes one static HTML file per route into `build/prerendered/` — 86 of
them — and the Node server streams them straight off disk. Nothing renders at
request time.

Two deliberate exceptions:

- **`POST /api/contact`** (`src/routes/api/contact/+server.ts`) is
  `prerender = false`. It exists only because `RESEND_API_KEY` must stay on the
  server. This is the sole reason the app uses `adapter-node` rather than
  `adapter-static`.
- **`/blogs/[slug]`** is `prerender = 'auto'` — the direct equivalent of Next's
  `dynamicParams = true`. Every article that existed at build time is a static
  file; an article published _since_ the last deploy falls through to the Node
  server and renders once on demand. Without this, the client-side refresh on
  `/blogs` (below) would surface fresh articles as links to a 404.

Consequence: **Strapi content changes require a rebuild.** There is no ISR.

### Key Directories

- `src/routes/` — pages and the one API endpoint
- `src/lib/components/` — all UI components (aliased `$components`)
- `src/lib/icons/` — generated icon components (aliased `$icons`), see below
- `src/lib/server/` — server-only modules; SvelteKit fails the build if a
  client module imports from here
- `src/lib/context/` — runes-based context state (`.svelte.ts` files)
- `src/lib/data/`, `src/lib/types/`, `src/lib/constants/`

### State Management

- **Active section** (`context/active-section.svelte.ts`) — tracks which
  section is in view for nav highlighting. `timeOfLastClick` suppresses the
  observer for 1s after a nav click so scrolling past intermediate sections
  can't steal the highlight.
- **Theme** (`context/theme.svelte.ts`) — dark/light with localStorage
  persistence. The class on `<html>` is applied _before first paint_ by the
  inline script in `app.html`; the class only stays in sync with it.
- Both are plain classes with `$state` fields, published via
  `setContext`/`getContext`.

### Data Layer

#### Two Strapi origins (`src/lib/constants/urls.ts` + `src/lib/server/strapi.ts`)

Inherited from the Next app. Do not collapse them:

- `STRAPI_URL` — browser-facing, from `PUBLIC_STRAPI_{DEV,PROD}_API_URL` via
  `$env/static/public`. Baked into the client bundle **and the prerendered
  HTML** (it builds every Strapi image URL), so it **must** be publicly
  reachable.
- `STRAPI_SERVER_URL` / `STRAPI_API_URL` — server-only, from
  `STRAPI_INTERNAL_URL` via `$env/dynamic/private`, falling back to
  `STRAPI_URL`. Lives under `src/lib/server/`, which makes "never reaches the
  browser" a build-time guarantee rather than a convention.

**Caveat inherited from the port:** now that every page is prerendered, nothing
reads Strapi at runtime, and the Docker builder is not attached to the `proxy`
network — so `STRAPI_INTERNAL_URL` is currently **inert**. It is kept because it
costs nothing and takes effect the moment a build runs with network access to
the Strapi container.

#### dev.to (`src/lib/devto.ts`)

Isomorphic on purpose — it runs at build time for prerendering and in the
browser for the `/blogs` refresh. The concurrency limiter (1 request at a time,
1.25s apart, exponential backoff on 429/5xx) exists for the cold build, which
fetches ~65 articles; the single-request browser path never engages it.

`getArticleBySlug` returns `null` **only** on a confirmed 404 and throws on
anything else. That distinction is load-bearing: returning `null` on a transient
429 would bake a live article as a permanent 404 page.

#### Stale-while-revalidate on /blogs

`/blogs` paints the prerendered list, then re-fetches dev.to's public
(CORS-enabled) articles endpoint from the browser and swaps in a fresher list.
Failures are silent by design — the build-time list is already on screen. This
is what makes publish-to-live work without a rebuild.

### Images

There is no `next/image` and no runtime image proxy. Three separate strategies:

- **Local photos** — `<enhanced:img>` (`@sveltejs/enhanced-img`) transcodes at
  build time into AVIF/WebP/JPEG with a srcset. The 2.6 MB source PNG in
  `src/lib/assets/` ships as a 3.6 KB AVIF at 1x. Local images must live in
  `src/lib/assets/`, not `static/`, for this to apply.
- **Strapi media** — `StrapiImage.svelte` builds a real `srcset` from Strapi's
  own `formats` (thumbnail/small/medium/large), which already carry exact URLs
  and pixel dimensions. The browser picks a variant and fetches it directly
  from Strapi: one hop, no encoding on our server.
- **dev.to covers** — `DevToImage.svelte` rewrites the `width=`/`height=` pair
  in dev.to's own imaging-CDN URL to synthesise a srcset. Those URLs already
  carry `format=auto`, so the CDN handles AVIF/WebP negotiation.

### Icons

`src/lib/icons/` is **generated, not hand-written**. The 78 icons the site uses
were lifted out of `react-icons`' own payloads and emitted as Svelte components
that mirror `react-icons`' `IconBase` attribute-for-attribute — same viewBox,
same paths, same `1em` sizing, same `currentColor`. Rendering is identical to
the Next site with no runtime icon library. Regenerate rather than edit by hand.

### Styling

`src/app.css` is the Next app's `globals.css`, carried over essentially
verbatim — Tailwind v4 `@theme`, `@utility` and `@custom-variant` are all
portable. Only the font wiring changed: `next/font/google` became self-hosted
`@fontsource-variable` imports, so the three families are fingerprinted assets
in our own bundle instead of a Google Fonts fetch.

Tailwind runs as a **Vite plugin** (`@tailwindcss/vite`), not through PostCSS.
There is no `postcss.config.js`; adding one will break `@import 'tailwindcss'`.

### Fonts: three things that must stay together

`next/font` did all of this automatically and losing any of it is a measurable
regression, so the manual equivalents are load-bearing:

1. **Latin-only `@font-face`, declared by hand** in `app.css`. The blanket
   `@import '@fontsource-variable/…'` pulls in every subset the family ships —
   17 faces across three families. The variable packages have no per-subset
   entry point, hence the hand-written rules.
2. **`<link rel="preload">` in `+layout.svelte`** for JetBrains Mono and
   Playfair Display, the two faces that render above the fold. Without them the
   browser cannot discover the fonts until `app.css` has parsed, which makes a
   three-hop critical chain (HTML → CSS → font). The URLs come from `?url`
   imports so they track the fingerprinted filenames. `crossorigin` is required
   even same-origin or the font is fetched twice.
3. **`… Fallback` faces with measured metric overrides.** Each webfont is paired
   with a local system font whose metrics are overridden to match, so the swap
   does not reflow the page. Dropping these took CLS from 0 to 0.155.

The override values were **measured**, not estimated — canvas `TextMetrics` on
the real faces. An earlier guess of `size-adjust: 132%` for JetBrains Mono was
wildly wrong (the true figure is ~100%, since it and Courier New are both
0.6em-advance monospace) and made the shift worse. If a family changes,
re-measure rather than eyeball it.

### `content-visibility` on home-page sections

The home page is one long document that inlines every project card, blog card
and open-source entry, so the browser laid out the whole thing before painting
anything. `main[data-defer-sections] > section:not(#home)` in `app.css` defers
style, layout and paint for offscreen sections, which cut main-thread work from
5.6s to 3.7s under Lighthouse's 4x CPU throttle with no visual change.

`contain-intrinsic-size: auto 720px` is the important half: the estimate is only
used until a section has been rendered once, after which the browser remembers
its real height and the scrollbar stops moving as you scroll.

### Scroll reveal animations

The `reveal` utility in `app.css` is the only reveal mechanism. It is pure CSS,
driven by `animation-timeline: view()` behind `@supports` and
`prefers-reduced-motion`.

Content is **visible by default** and the animation is layered on top. Do not
reintroduce JS-gated reveals: an `IntersectionObserver` ratio is measured
against the _target's_ area, so a container taller than 10x the viewport can
never cross a `0.1` threshold, and long project pages rendered blank. For the
same reason `animation-range` is length-based (`entry 0% entry 300px`), not a
percentage.

### robots.txt, sitemap.xml, llms.txt

All three are **prerendered routes**, not files in `static/`, so their contents
are generated from the same sources that decide which pages exist:

- `sitemap.xml` is built from `getAllProjectSlugs()` and `getAllArticles()` —
  the same two calls that drive `entries()` for the dynamic routes. It therefore
  cannot list a page that was not prerendered, or miss one that was. A build
  check confirms the counts match exactly (86 and 86).
- `robots.txt` interpolates `SITE_URL` for its `Sitemap:` line, so the pointer
  cannot drift from the sitemap's own `<loc>` values.
- `llms.txt` follows the llmstxt.org convention. It is a young convention, not
  a standard, and nothing depends on it.

The origin URL lives once in `src/lib/site.ts`. The per-route `<link
rel="canonical">` and OpenGraph tags still hardcode `https://pranta.dev`; if the
domain ever changes, those need updating too.

**Cloudflare note:** with no robots.txt at the origin, Cloudflare served its own
Content Signals boilerplate — 24 lines of comments with no `User-agent`,
`Allow` or `Sitemap` directive at all, so crawlers got no sitemap pointer.
Cloudflare appends its signals to a real robots.txt rather than replacing it, so
the route now supplies the actual rules. Expect the deployed file to be our
directives plus Cloudflare's comment block.

### Client-side tag filtering on /projects

`/projects` used to read `?tags=` on the server, which is exactly what kept it
dynamic (the Next build reported it as `ƒ server-rendered on demand`). The page
is now a single static file listing every project, and the filter is applied in
the browser from `page.url.searchParams`.

`page.url.searchParams` **throws during prerendering** — a static file cannot
depend on a query string — so the read is guarded by `browser`. Keep that guard.

## Environment Variables

See `.env.example`. Local development reads `.env`.

| Variable                     | Scope                 | Notes                                                                                                       |
| ---------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `PUBLIC_STRAPI_PROD_API_URL` | build time            | Public Strapi URL, baked into the bundle and the prerendered HTML. Needs a rebuild.                         |
| `PUBLIC_STRAPI_DEV_API_URL`  | build time            | Public Strapi URL for development.                                                                          |
| `STRAPI_API_KEY`             | **build time only**   | Bearer token. Every page is prerendered from Strapi, so the build needs it; the running container does not. |
| `RESEND_API_KEY`             | runtime               | Contact form delivery. The only secret the container needs.                                                 |
| `ORIGIN`                     | runtime, **required** | See below. Without it the contact form 403s in production.                                                  |
| `STRAPI_INTERNAL_URL`        | runtime, server-only  | Currently inert — see the Strapi note above.                                                                |

### `ORIGIN` is required in production

`adapter-node` compares the `Origin` header against the site's own origin on
form POSTs, as CSRF protection. Behind Traefik it cannot infer the public URL,
so without `ORIGIN=https://pranta.dev` every contact-form submission is
rejected with `Cross-site POST form submissions are forbidden` (403). It is set
in `compose.yml`. `vite dev` and `vite preview` handle this themselves, so the
failure only shows up in the container.

## Deployment (self-hosted VPS + Traefik)

`Dockerfile` + `compose.yml` mirror the Next setup and the sibling
`../portfolio-strapi-cms`.

- Multi-stage: install/build on `oven/bun:1` (the repo is locked with
  `bun.lock`), production deps resolved in a separate bun stage, runtime on
  `node:24-slim` running `node build/index.js` as the non-root `node` user.
  - Do **not** try to slim this down by copying the `bun` binary into a Node
    image — that fails with a wall of `IntegrityCheckFailed extracting tarball`
    errors during `bun install`. Use the official bun image for those stages.
- `adapter-static` is _not_ used, purely because of `/api/contact`. Every page
  is still a static file; see the top of this document.
- `precompress: true` emits `.br` and `.gz` beside every asset at build time,
  so compression costs nothing per request.
- The container joins the **external** `proxy` network shared with Traefik and
  the Strapi container.

Routing: `pranta.dev` and `www.pranta.dev` on an exact-host router
(priority 100), plus a `*.pranta.dev` `HostRegexp` catch-all at **priority 1**.
The low priority is load-bearing — Traefik's default priority is the rule
length, and the wildcard rule is longer than the CMS's
``Host(`portfolio.pranta.dev`)``, so without it the wildcard would hijack the
backend.

Both routers use the **`cloudflare`** cert resolver, not `letsencrypt`. A
wildcard certificate can only be issued over a DNS-01 challenge, and the
`letsencrypt` resolver on the VPS is HTTP-01. The Traefik static config
(`/root/traefik/traefik.yml`, not in any repo) therefore defines two resolvers:

- `letsencrypt` — HTTP-01, used by every other service on the box. Untouched.
- `cloudflare` — DNS-01 via the Cloudflare provider, separate storage at
  `/acme-dns.json`, token supplied as `CF_DNS_API_TOKEN` from
  `/root/traefik/.env`.

Both routers declare identical `tls.domains` (`pranta.dev` + `*.pranta.dev`) so
a single certificate covers the apex, www, and all subdomains.

```bash
docker compose build
docker compose up -d --remove-orphans
```

**Both projects claim the same Traefik router names and the same hostnames.**
Only one of `portfolio-nextjs-web` and `portfolio-svelte-web` can be up at a
time. Stop the old one before starting this one.

## Development Notes

- **Bun** as package manager (`bun.lock`)
- Svelte 5 **runes** throughout — `$state`, `$derived`, `$props`, `$effect`.
  No `export let`, no stores except where a class field is genuinely awkward
- Node.js >=24 required (`engines`)
- ESLint flat config (`eslint.config.js`); `svelte/no-navigation-without-resolve`
  is off because the app has no `paths.base`
- Prettier with `prettier-plugin-svelte` + `prettier-plugin-tailwindcss`

### Component Patterns

- Components are static by default. Interactivity is added where there is real
  state, an event handler, or a browser API — the same discipline the Next app
  applied with `'use client'`, and for the same reason.
- Navigation uses plain `<a href>`. SvelteKit intercepts same-origin anchors
  for client-side routing automatically, so there is never a reason to call
  `goto()` from an `onclick` on a link — that produces markup no keyboard user
  or crawler can use. `ProjectTagFilter` calls `goto()` because its controls are
  genuinely buttons that mutate a query string, not links.
- `SectionMarker` / `sectionInView` are deliberate: tiny sentinels that keep the
  active-section context in sync without making whole sections interactive.
  `Skills` applies the action to its own `<section>` because the React version
  used a ref there rather than a sentinel.

### Keeping a component out of the prerendered HTML is a last resort

`ThemeSwitchLazy` is the one legitimate case: its icon depends on the stored
theme, which only exists in the browser, so prerendering it would bake in the
wrong icon and visibly swap after hydration. Everything else server-renders
fine — needing `$state` is not a reason to skip SSR. Under Next this same
mistake once wrapped a whole project page in `dynamic(..., { ssr: false })` and
prerendered it to an empty shell.
