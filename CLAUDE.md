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

A SvelteKit 3 / Svelte 5 portfolio site. Ported from Next.js 16 (the previous
implementation is retired and no longer checked out locally — it is archived at
https://github.com/theprantadutta/portfolio-nextjs-web if a behaviour ever needs
checking against the original), then redesigned in October 2026 as **"Commit
Log"**: the career rendered as a git repository. Home is a commit graph plus a
GitHub heatmap, /about is a README, projects are repos, /open-source is merged
PRs, /contact is "Open a pull request". The design handoff (screens, tokens,
motion spec) lives outside the repo; `TODO_CONTENT.md` lists the copy still
waiting on Pranta.

### The core decision: everything is prerendered

`src/routes/+layout.ts` sets `prerender = true` for the whole route tree. The
build writes one static file per route into `build/prerendered/` (pages,
`/search.json`, `/blogs/rss.xml`, the sitemap and every `/og/*.png` share
card) and the Node server streams them straight off disk.

The exceptions, all deliberate:

- **`POST /api/contact`**: `RESEND_API_KEY` must stay on the server. This is
  why the app uses `adapter-node` rather than `adapter-static`.
- **`/api/reactions/[slug]`** (GET/POST): blog reaction counts, read and
  written live through Strapi with `STRAPI_REACTIONS_TOKEN`.
- **`/api/github/activity`**: the heatmap's live refresh, fetched from GitHub
  at most once a day and held in memory.
- **`/download-cv`**: see "The CV lives behind a permanent URL".
- **`/blogs/[slug]`** is `prerender = 'auto'` — the direct equivalent of
  Next's `dynamicParams = true`. Every article that existed at build time is a
  static file; an article published _since_ the last deploy falls through to
  the Node server and renders once on demand. Without this, the client-side
  refresh on `/blogs` (below) would surface fresh articles as links to a 404.

Consequence: **Strapi content changes require a rebuild.** There is no ISR.
Blog reactions and the heatmap are the only things that change without one.

### Key Directories

- `src/routes/` — pages, the API endpoints, and the prerendered feeds/cards
- `src/lib/components/` (imported as `#components/…`), grouped by area: `chrome/`
  (nav, mobile menu, ⌘K palette, toasts, page glows), `git/` (commit graph,
  heatmap), `ui/` (page header, word reveal, count-up, avatar), and one folder
  per page area (`projects/`, `blog/`, `about/`, `skills/`, `oss/`,
  `contact/`)
- `src/lib/motion/` — the motion system's JavaScript half (see "Motion")
- `src/lib/data/` — typed site content: profile, commits, skills, experience,
  open source, and the committed GitHub snapshot
- `src/lib/server/` — server-only modules; SvelteKit fails the build if a
  client module imports from here
- `src/lib/context/` — runes-based state (`.svelte.ts` files)
- `src/lib/types/`, `src/lib/constants/`

### State Management

- **Theme** (`context/theme.svelte.ts`): light/dark as `data-theme` on
  `<html>`, persisted to localStorage, defaulting to the OS preference. The
  attribute is set _before first paint_ by the inline script in `app.html`;
  the class only reads it back. Toggling uses a view transition that reveals
  the new theme in a circle from the button (`html[data-vt="theme"]` in
  app.css), falling back to a 200ms colour fade.
- **Overlays** (`context/ui.svelte.ts`): which of the mobile menu and the
  command palette is open. A module singleton because the keyboard shortcuts
  (⌘K/Ctrl+K anywhere, `/` outside /blogs), the nav and the overlays live in
  different branches of the layout. Only ever written in the browser.
- **Site index** (`site-index.svelte.ts`): `/search.json` (every project and
  post, plus counts), loaded at idle and shared by the palette and the menu.
- **URL state**: `?type=` (projects filter), `?tab=` (project page tab) and
  `?q=` (blog search) are written with a shallow `goto` and read only in the
  browser (see "Query strings on prerendered pages").

### Data Layer

#### Two Strapi origins (`src/lib/constants/urls.ts` + `src/lib/server/strapi.ts`)

Inherited from the Next app. Do not collapse them:

- `STRAPI_URL` — browser-facing, from `PUBLIC_STRAPI_{DEV,PROD}_API_URL` via
  `$app/env/public` (declared static). Baked into the client bundle **and the prerendered
  HTML** (it builds every Strapi image URL), so it **must** be publicly
  reachable.
- `STRAPI_SERVER_URL` / `STRAPI_API_URL` — server-only, from
  `STRAPI_INTERNAL_URL` via `$app/env/private`, falling back to
  `STRAPI_URL`. Lives under `src/lib/server/`, which makes "never reaches the
  browser" a build-time guarantee rather than a convention.

The build never sees `STRAPI_INTERNAL_URL` (the Docker builder is not on the
`proxy` network), so prerendering always uses the public URL. At runtime the
blog reactions endpoint does talk to Strapi, and compose sets
`STRAPI_INTERNAL_URL` so those calls stay on the Docker network.

On the VPS the public URL must not go through Cloudflare: Cloudflare answers
requests from the server's own IP with a bot challenge, a 403 HTML page
(`cf-mitigated: challenge`) that looks exactly like Strapi refusing the token.
`compose.yml` therefore maps `portfolio.pranta.dev` to `host-gateway` for the
build, so prerendering reaches Traefik on the same machine directly. If a
build fails with `Strapi request failed – 403`, check for that header before
suspecting the key.

#### dev.to (`src/lib/devto.ts`)

Isomorphic on purpose — it runs at build time for prerendering and in the
browser for the `/blogs` refresh. The concurrency limiter (1 request at a time,
1.25s apart, exponential backoff on 429/5xx) exists for the cold build, which
fetches ~65 articles; the single-request browser path never engages it.

`getArticleBySlug` returns `null` **only** on a confirmed 404 and throws on
anything else. That distinction is load-bearing: returning `null` on a transient
429 would bake a live article as a permanent 404 page.

#### Build-time dedupe (`src/lib/memo.ts`)

Prerendering runs every page's load in one process, and most pages need the
same lists. `getAllProjects`, `getAllReactionCounts` and (server-side only)
`getAllArticles` share one promise per key for ten minutes, so a build makes
each request once instead of once per page. Before this, dev.to's rate limiter
made that minutes of waiting.

Strapi's REST API pages at 25 by default; every list asks for 100
(`PAGE_SIZE`). Without it the 26th project would silently vanish.

#### Newer fields in Strapi

Projects gained optional `metric`, `impactStats` and `changelog` (the
redesign), then `screenshots` (ordered screenshots). A CMS that predates a
field answers 400 to a query naming it, so `getAllProjects` retries with the
newest group dropped (`OPTIONAL_FIELDS` / `withOptionalFields`) and
`getProjectBySlug` falls back to `populate=*`, each logging a warning. Deploy
the CMS first and the warnings go away. Everything else about a project
(kind, language, categories, status) is derived from fields the CMS already
had, in `src/lib/projects.ts`.

#### Screenshots and the feature graphic

`screenshots` is a repeatable component (`order`, `image`, optional
`caption`); the site sorts by `order`, then by position in the list. A
project with no `screenshots` entries falls back to the older `imageUrls`
media field in upload order, so projects can move over one at a time.

The `cover` doubles as the Google Play **feature graphic**: when it is
1024 × 500 (any image within 3% of that 2.048:1 shape), the project page
shows it as a banner above the overview and the pinned card shows it in its
panel. Any other cover (most are still phone screenshots) is ignored there,
and those projects keep the three-phone gallery. Uploading a 1024 × 500 cover
is all it takes to switch a project.

#### GitHub (`src/lib/github.ts` + `src/lib/server/github.ts`)

The heatmap, the PR diff sizes and repository cards (stars, primary language,
org avatar) on /open-source and the languages bar on /about come from the
GitHub GraphQL API with `GITHUB_TOKEN`, once per build. Adding a contribution
to `src/lib/data/open-source.ts` is enough for its repository to get a card;
refresh the snapshot afterwards so token-less builds have its numbers too. Without
a token, or if GitHub fails, the build uses the committed snapshot in
`src/lib/data/github.snapshot.json` instead of failing. Refresh it with
`GITHUB_TOKEN=$(gh auth token) bun scripts/refresh-github-snapshot.ts`.

Languages are counted **per repository by primary language** (public, non-fork,
pushed in the last 24 months), not by bytes: bytes are dominated by generated
Flutter runners (C++, CMake) and vendored bundles.

#### Blog reactions

Counts live in Strapi's `post-reaction` collection (one row per post and
emoji). The build reads them all once with the read-only key; the post page
then refreshes from `/api/reactions/[slug]`, which writes through the custom
`POST /api/post-reactions/react` action using `STRAPI_REACTIONS_TOKEN`
(rate-limited per address). Which reactions a visitor toggled lives in their
localStorage.

#### Stale-while-revalidate on /blogs

`/blogs` paints the prerendered list, then re-fetches dev.to's public
(CORS-enabled) articles endpoint from the browser and swaps in a fresher list.
Failures are silent by design — the build-time list is already on screen. This
is what makes publish-to-live work without a rebuild.

### Images

There is no `next/image` and no runtime image proxy. Three separate strategies:

- **Local photos** — `<enhanced:img>` (`@sveltejs/enhanced-img`) transcodes at
  build time into AVIF/WebP with a srcset. The avatar (`Avatar.svelte`, a
  square crop of the original illustration) is imported with explicit widths,
  `avatar.png?w=192;96;64;32&enhanced`; `enhanced` goes last so the one
  pattern in `src/ambient.d.ts` types every such import. Local images must
  live in `src/lib/assets/`, not `static/`, for this to apply.
- **Strapi media** — `toImageRef` in `src/lib/projects.ts` builds a real
  `srcset` from Strapi's own `formats` (thumbnail/small/medium/large), which
  already carry exact URLs and pixel dimensions. The browser picks a variant
  and fetches it directly from Strapi: one hop, no encoding on our server.
- **dev.to covers** — `DevToImage.svelte` rewrites the `width=`/`height=` pair
  in dev.to's own imaging-CDN URL to synthesise a srcset. Those URLs already
  carry `format=auto`, so the CDN handles AVIF/WebP negotiation.

### Icons

Lucide (`@lucide/svelte`), imported per icon from `@lucide/svelte/icons/<name>`
at 16px with a 1.75 stroke, only where an icon reads better than text (theme,
search, menu, copy, chevrons). Arrows and the git glyphs (→ ↗ ↓ ⇄ ✓ ●) are text
in the mono font, as the design has them. The old generated react-icons set and
its script are gone.

Brand marks (GitHub, LinkedIn, X, Google Play, Apple) come from Font Awesome
Free's brand set (`src/lib/brand-icons.ts`, rendered by
`#components/ui/BrandIcon.svelte` in `currentColor`). Lucide no longer ships
brand logos, and Simple Icons dropped LinkedIn's. The icons are CC BY 4.0, so
the attribution must ship with the code: `brand-icons.ts` carries a `/*!`
comment (a plain module, because the Svelte compiler drops comments), and
`vite.config.ts` sets `comments: { legal: true }` because Vite strips legal
comments when it minifies. Never use a glyph like `` for a brand: it only
renders on Apple devices.

Inline cards and sheets follow the theme, even where the handoff drew them
dark: the mobile menu, the open-source banner, the Impact card and the
availability card all use the tokens. Pranta asked for this on 2026-10-13. The
exceptions are overlays that float over content (toasts, the blog reaction
bar, the screenshot lightbox).

### Styling

`src/app.css` holds everything global: the Geist faces, the design tokens
(light in `:root`, dark in `[data-theme="dark"]`), the Tailwind `@theme`
mapping, the ambient and entrance keyframes, the motion gates and a handful of
shared component classes (`.card`, `.btn`, `.pill`, `.chip`, `.field`,
`.eyebrow`, `.h-page`). Components style themselves in scoped `<style>`
blocks against those tokens. **The tokens are the only colours**: never add a
literal colour that a token already covers.

Tailwind runs as a **Vite plugin** (`@tailwindcss/vite`), not through PostCSS.
There is no `postcss.config.js`; adding one will break `@import 'tailwindcss'`.
Token colours are mapped with `@theme inline` so utilities follow the theme.

### Fonts: three things that must stay together

Geist and Geist Mono (`@fontsource-variable/*`). Losing any of these is a
measurable regression:

1. **Latin-only `@font-face`, declared by hand** in `app.css`. The blanket
   `@import '@fontsource-variable/…'` declares every subset the family ships.
2. **`<link rel="preload">` in `+layout.svelte`** for both faces (both render
   above the fold everywhere). The URLs come from `?url` imports so they track
   the fingerprinted filenames. `crossorigin` is required even same-origin or
   the font is fetched twice.
3. **`… Fallback` faces with metric overrides**, from capsize's measurements
   of the real files (`@capsizecss/metrics` geist/geistMono against
   arial/courierNew), so the swap does not reflow the page. If a family
   changes, recompute them rather than guessing. An earlier guess for a
   previous font made CLS worse, not better.

The OG cards use the static `@fontsource/geist*` woff files instead, because
satori cannot read woff2.

### Motion

The spec is the design handoff's MOTION.md; the implementation has three layers.

**Page-load choreography (CSS, no hydration needed).** The inline script in
`app.html` sets `data-js` immediately and `data-ready` once both webfonts
have loaded (capped at 900ms). Elements with `.enter`, `.enter-x`,
`.enter-down`, `.type-on` or inside `.word` are hidden only while
`data-js` is set and `data-ready` is not, then play their keyframes with a
per-element `--d` delay. Without JavaScript neither attribute exists and
everything simply renders. Elements added by client-side navigation animate on
insertion, since `data-ready` is already set.

**Entrance keyframes animate `translate`/`scale`, never `transform`.** They
fill forwards, and a filled `transform` would permanently override hover lifts
(`.lift`) and the nav's tuck. Keep it that way.

**Scroll reveals (`motion/reveal.ts`).** Arm only what starts below the fold
(`data-reveal="armed"`), reveal on first intersection with threshold 0.
Threshold 0 matters: a ratio is measured against the target's own area, so a
container many viewports tall could never reach it and would stay blank (the
bug that sank the old JS reveal). The commit graph and heatmap follow the same
rule: they play with the page load when on screen, and re-arm to play on
scroll when they mount below the fold.

**Ambient loops** (glow drift, headline shimmer, heatmap sweep, pulse) are CSS
and pause offscreen or in a background tab via the `ambient` action
(`data-paused`). Reduced motion turns all loops off, swaps entrances for
150ms fades, and skips count-ups, confetti, particles and smooth scrolling.

The hero headline's gradient is painted per word with
`background-attachment: fixed`: each word animates on its own layer, and a
parent's `background-clip: text` cannot see text on a child layer.

Route changes use view transitions (`onNavigate` in the layout): the old page
fades over 160ms, the new one plays its entrances, and shared elements morph by
`view-transition-name` (`project-title-*`, `project-shot-*`,
`post-cover-*`, `post-title-*`, `nav-avatar`). Query-string changes skip it.

Smooth scrolling is Lenis on fine pointers only (`smooth-scroll.ts`). It also
owns the scroll lock overlays use.

**Testing note:** full-page captures of sticky elements (the mobile CTA row,
the nav) show them at the first viewport's position; that is the capture, not
the page.

### robots.txt, sitemap.xml, llms.txt, search.json, rss.xml, og/*.png

All **prerendered routes**, not files in `static/`, so their contents come
from the same sources that decide which pages exist:

- `sitemap.xml` lists the static pages plus every project and article, from
  the same calls that drive `entries()` for the dynamic routes.
- `robots.txt` interpolates `SITE_URL` for its `Sitemap:` line.
- `llms.txt` follows the llmstxt.org convention (a young convention, not a
  standard). Its counts are computed, not typed.
- `search.json` feeds the ⌘K palette and the mobile menu's counts.
- `blogs/rss.xml` is the blog's RSS feed, linked from `app.html`.
- `og/[page].png` and `og/projects/[slug].png` are share cards rendered at
  build time with satori + resvg in the site's own style
  (`src/lib/server/og.ts`). satori sizes boxes as content-box and has no
  `oklch()`, which is why the card root sets `boxSizing` and the accents are
  written as sRGB hex. `@resvg/resvg-js` is a native module, so it is a runtime
  dependency (adapter-node cannot bundle it), even though only the build calls
  it.

The origin URL lives once in `src/lib/site.ts`.

**Cloudflare note:** with no robots.txt at the origin, Cloudflare served its own
Content Signals boilerplate — 24 lines of comments with no `User-agent`,
`Allow` or `Sitemap` directive at all, so crawlers got no sitemap pointer.
Cloudflare appends its signals to a real robots.txt rather than replacing it, so
the route now supplies the actual rules. Expect the deployed file to be our
directives plus Cloudflare's comment block.

### The CV lives behind a permanent URL

`/download-cv` is a non-prerendered endpoint that serves `src/lib/assets/cv.pdf`.

The point is that recruiters keep the link. A dated filename makes a dated URL,
so every revision silently broke whatever link was already sitting in an inbox
or an application form. The URL is now fixed and the file behind it changes.

**To publish a new CV:**

1. Replace `src/lib/assets/cv.pdf`. Keep that filename — the date goes in step
   2, not here.
2. Update `CV_DOWNLOAD_FILENAME` in `src/lib/constants/selectors.ts` — the date
   still belongs in the _saved_ filename so a recruiter can tell revisions
   apart, it just no longer belongs in the URL.

Nothing else changes. The ETag is a hash of the bytes, so a new CV invalidates
caches by itself.

Do **not** drop the PDF into `static/` and link it directly. That is the
arrangement this replaced, and it is the thing that breaks links already sent
out. Verify a change with:

```bash
curl -sD- -o /dev/null http://localhost:4173/download-cv
```

Expect `200`, `content-type: application/pdf`, and a `content-disposition`
naming the new dated file.

Two things about this route are load-bearing:

- It **cannot be prerendered**. Prerendering writes the body to a file and lets
  the static server re-derive headers from the extension, which drops
  `Content-Disposition` — the header that makes browsers save the file under
  the dated name rather than opening a PDF viewer on a URL called
  "download-cv". Symptom: the browser opens a PDF viewer and saves the file as
  `download-cv` with no extension.
- The PDF is imported with **`?inline`**, so Vite bundles it into the server
  chunk as base64 instead of emitting a hashed file. That way serving it needs
  no filesystem path, which would otherwise differ between `vite preview` and
  the Docker image.

### Query strings on prerendered pages

`/projects?type=`, `/projects/[slug]?tab=` and `/blogs?q=` are all handled in
the browser against data baked into the page, so each page stays one static
file. `page.url.searchParams` **throws during prerendering** — a static file
cannot depend on a query string — so the value is read in `onMount` (or behind
`browser`) and written back with `goto(url, { shallow: true, replace: true,
state: page.state })`. Without `shallow` it would be a real navigation that
re-runs the page.

Shallow `goto` calls fire navigation hooks in SvelteKit 3 (the deprecated
`replaceState` did not). The layout's `onNavigate`/`afterNavigate` and
`NavProgress` check `shallow` so a filter click does not start a view
transition, close the overlays or flash the progress bar. Keep those checks.
`page.url` is read-only: copy it with `new URL(page.url.href)` before editing
its search params.

## Environment Variables

See `.env.example`. Local development reads `.env`. Every variable is declared
in `src/env.ts` (`defineEnvVars`) and imported from `$app/env/public` or
`$app/env/private`; add new ones there first. The private ones default to the
empty string, which every reader treats as "not configured".

| Variable                     | Scope                | Notes                                                                                                       |
| ---------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `PUBLIC_STRAPI_PROD_API_URL` | build time           | Public Strapi URL, baked into the bundle and the prerendered HTML. Needs a rebuild.                         |
| `PUBLIC_STRAPI_DEV_API_URL`  | build time           | Public Strapi URL for development.                                                                          |
| `STRAPI_API_KEY`             | **build time only**  | Bearer token. Every page is prerendered from Strapi, so the build needs it; the running container does not. |
| `GITHUB_TOKEN`               | build time + runtime | Optional. Fresh GitHub data in the build; keeps the heatmap live at runtime. Falls back to the snapshot.    |
| `RESEND_API_KEY`             | runtime              | Contact form delivery.                                                                                      |
| `STRAPI_REACTIONS_TOKEN`     | runtime              | Strapi "Custom" token with only Post-reaction find + react. Blog reactions 503 without it.                  |
| `STRAPI_INTERNAL_URL`        | runtime, server-only | Set in compose so runtime reaction calls stay on the Docker network.                                        |

### The public origin is `paths.origin`, not `ORIGIN`

SvelteKit compares the `Origin` header of form POSTs against the site's own
origin, as CSRF protection. Behind Traefik the server cannot infer the public
URL, so `vite.config.ts` sets `paths.origin` to `SITE_URL`. Without it, the
contact form posted with JavaScript off would be rejected with a 403. The
JavaScript path posts JSON, which the check ignores.

SvelteKit 3 removed adapter-node's `ORIGIN` environment variable, so do not
add it back to `compose.yml` expecting it to do anything. Because the origin is
fixed at build time, a no-JS form post to `vite preview` on localhost is also
rejected as cross-site; test that path with an `Origin: https://pranta.dev`
header. `paths.origin` is also the `url.origin` prerendering sees.

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

This is the only app serving `pranta.dev`. The retired Next project declared
the same Traefik router names and hostnames, so if it is ever redeployed from
its archive the two will collide and only one can be up at a time.

## Development Notes

- **Bun** as package manager (`bun.lock`)
- SvelteKit 3: the config is the `sveltekit({...})` call in `vite.config.ts`
  (there is no `svelte.config.js`), and `tsconfig.json` extends the generated
  `$app/tsconfig`
- Imports use the subpath imports in `package.json`: `#lib/…` for `src/lib`
  and `#components/…` for `src/lib/components`, always with the file
  extension (`#lib/site.js`, `#lib/context/ui.svelte.js`,
  `#components/ui/Avatar.svelte`). There is no `$lib`, and kit's `alias`
  option is deprecated
- Endpoints answer with `Response.json(...)`; kit's `json()`/`text()` helpers
  are deprecated
- **`patches/@sveltejs%2Fkit@3.0.1.patch` is temporary.** SvelteKit 3.0.1 with
  adapter-node 6 serves prerendered pages with no `Content-Type` at all,
  because `.html` never reaches the build's MIME table
  (sveltejs/kit#17380). The patch backports the upstream fix (#17381), and
  `bun install` applies it through `patchedDependencies`. When kit is upgraded
  past 3.0.1, delete the patch, the `patchedDependencies` entry and the two
  `COPY patches` lines in the Dockerfile, then check that
  `curl -sI http://localhost:3000/` on `node build/index.js` still says
  `text/html`. `vite preview` uses a different static server and never
  showed the bug
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
  or crawler can use. Filters, tabs and search are buttons and inputs, not
  links, so they update the query string with a shallow `goto`.
- **Every link that leaves the site opens in a new tab**
  (`target="_blank" rel="noopener noreferrer"`), Pranta's rule. That includes
  dev.to articles' own links, which `externalLinks` in
  `src/lib/server/article-html.ts` rewrites, and the Strapi rich-text
  renderer. Links back to pranta.dev, `/…` paths, `#` anchors and `mailto:`
  stay in the tab. To check, scan `build/prerendered/**/*.html` after a build
  for `<a href="http…">` without `target="_blank"`; on 2026-10-13 that was 0
  of 292.
- On /open-source a repository card links to the contribution, not the
  repo's front page: the PR itself when there is one, otherwise GitHub's
  list of Pranta's merged PRs in that repo.

### Keeping a component out of the prerendered HTML is a last resort

Nothing currently needs it. The theme toggle used to be the one exception
(`ThemeSwitchLazy`); it now renders both icons and lets CSS pick from
`data-theme`, so the prerendered button is right before hydration. Needing
`$state` is not a reason to skip SSR. Under Next this same mistake once wrapped
a whole project page in `dynamic(..., { ssr: false })` and prerendered it to an
empty shell.
