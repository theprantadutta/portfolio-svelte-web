# syntax=docker/dockerfile:1

# This repo is locked with bun.lock, so install/build run on the official bun
# image. adapter-node emits a plain Node server, so the runtime stage drops back
# to a slim Node image.
#
# Do NOT try to slim this down by copying the `bun` binary into a Node image —
# that fails with a wall of `IntegrityCheckFailed extracting tarball` errors
# during `bun install`. Use the official bun image for those stages.
ARG NODE_VERSION=24-slim
ARG BUN_VERSION=1

# ============================================
# Stage 1: install dependencies
# ============================================
FROM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app
COPY package.json bun.lock .npmrc ./
RUN bun install --frozen-lockfile

# ============================================
# Stage 2: build
# ============================================
FROM oven/bun:${BUN_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# PUBLIC_* values are inlined into the client bundle AND into the prerendered
# HTML (they build the Strapi image URLs), so they have to be present HERE.
# Setting them at runtime in compose does nothing for anything already baked.
ARG PUBLIC_STRAPI_PROD_API_URL
ARG PUBLIC_STRAPI_DEV_API_URL
ENV PUBLIC_STRAPI_PROD_API_URL=${PUBLIC_STRAPI_PROD_API_URL}
ENV PUBLIC_STRAPI_DEV_API_URL=${PUBLIC_STRAPI_DEV_API_URL}

# Strapi and dev.to are queried during the build to prerender every page. The
# builder is not attached to the `proxy` network, so this talks to the public
# Strapi URL above — STRAPI_INTERNAL_URL is deliberately not set here.
ARG STRAPI_API_KEY
ENV STRAPI_API_KEY=${STRAPI_API_KEY}

ENV NODE_ENV=production
RUN bun run build

# ============================================
# Stage 3: production dependencies only
# ============================================
# adapter-node bundles the app itself, but the SvelteKit docs still require the
# production dependencies (here: resend, used by /api/contact) alongside it.
FROM oven/bun:${BUN_VERSION} AS prod-deps
WORKDIR /app
COPY package.json bun.lock .npmrc ./
RUN bun install --frozen-lockfile --production

# ============================================
# Stage 4: runtime
# ============================================
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/build ./build
COPY --from=builder --chown=node:node /app/package.json ./package.json

USER node
EXPOSE 3000
CMD ["node", "build/index.js"]
