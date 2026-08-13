# portfolio-svelte-web

Personal portfolio site for [pranta.dev](https://pranta.dev) — SvelteKit 2,
Svelte 5, Tailwind CSS v4, content from a self-hosted Strapi CMS and dev.to.

A port of `../portfolio-nextjs-web` (Next.js 16). The design is unchanged; the
rendering model is not.

## Why the port

Every page is now **prerendered to a static HTML file at build time** and served
straight off disk. Nothing is rendered per request.

Measured against the Next build, same machine, same content, everything gzipped
at the same level:

| Route              | Next total | Svelte total | JS+CSS (Next → Svelte) |  Server time |
| ------------------ | ---------: | -----------: | ---------------------: | -----------: |
| `/`                |     322 kB |       164 kB |        251 kB → 115 kB | 23 ms → 6 ms |
| `/projects`        |     270 kB |       133 kB |         227 kB → 75 kB | 92 ms → 7 ms |
| `/blogs`           |     255 kB |       102 kB |         214 kB → 67 kB | 27 ms → 6 ms |
| `/projects/[slug]` |     251 kB |        95 kB |         233 kB → 82 kB |  8 ms → 3 ms |
| `/blogs/[slug]`    |     232 kB |        77 kB |         214 kB → 66 kB |  7 ms → 3 ms |

Roughly **57% less to download** and **3–13x faster server response**. The
`/projects` gap is the largest because Next rendered that route on demand
(it used `searchParams` for tag filtering); it is now a static file with the
filter applied in the browser.

Beyond the framework, three things account for most of the win:

- **No icon library.** `react-icons` pulled a runtime into the bundle. The 78
  icons in use are now inline SVG components generated from `react-icons`' own
  data, so they render identically at zero runtime cost.
- **Build-time image processing.** The 2.6 MB profile PNG ships as a 3.6 KB
  AVIF. Strapi and dev.to images get real `srcset`s built from metadata their
  own APIs already provide, so no image proxy sits in the request path.
- **Self-hosted fonts.** Three variable families as fingerprinted local assets
  instead of a Google Fonts round trip.

## Getting started

```bash
bun install
cp .env.example .env    # fill in STRAPI_API_KEY and RESEND_API_KEY
bun dev                 # http://localhost:5173
```

The build talks to Strapi and dev.to, so `STRAPI_API_KEY` and network access are
required to build.

```bash
bun run build
bun run preview         # http://localhost:4173
```

## Commands

| Command           | Does                                     |
| ----------------- | ---------------------------------------- |
| `bun dev`         | Dev server on :5173                      |
| `bun run build`   | Production build (prerenders every page) |
| `bun run preview` | Serve the production build on :4173      |
| `bun start`       | Run the built Node server                |
| `bun run check`   | svelte-check — types, a11y, unused CSS   |
| `bun run lint`    | ESLint                                   |
| `bun format:fix`  | Prettier                                 |

## Architecture at a glance

```
src/
  app.html                    inline theme script (runs before first paint)
  app.css                     Tailwind v4 design system, carried over verbatim
  routes/
    +layout.ts                prerender = true for the whole tree
    +page.server.ts           home data, fetched once at build
    projects/                 list + [slug], prerendered via entries()
    blogs/                    list + [slug] (prerender: 'auto')
    api/contact/+server.ts    the only route that runs per request
  lib/
    components/               UI
    icons/                    78 generated SVG components
    server/                   server-only modules (Strapi, email)
    context/                  runes state: theme, active section
    devto.ts                  isomorphic dev.to client with rate limiting
```

Content updates from Strapi require a rebuild. New dev.to articles do not — the
blog list revalidates in the browser against dev.to's public API, and
`/blogs/[slug]` renders on demand for posts newer than the build.

## Deployment

Docker + Traefik on a self-hosted VPS. See `CLAUDE.md` for the full topology,
including the two Traefik cert resolvers and why the wildcard router needs an
explicit low priority.

```bash
docker compose build
docker compose up -d --remove-orphans
```

`ORIGIN=https://pranta.dev` must be set in the container or the contact form
returns 403 — `adapter-node` uses it for CSRF checks and cannot infer it behind
a proxy. It is already in `compose.yml`.

Note that this project and `portfolio-nextjs-web` declare the same Traefik
router names and hostnames, so only one can run at a time.
