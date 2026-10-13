import {
  PUBLIC_STRAPI_DEV_API_URL,
  PUBLIC_STRAPI_PROD_API_URL,
} from '$app/env/public'
import { dev } from '$app/env'

/**
 * Browser-facing Strapi origin.
 *
 * Inlined into the client bundle at build time and used by `getStrapiMedia()`
 * to build image sources, so it MUST stay a publicly reachable URL — a
 * Docker-internal hostname would not resolve here.
 *
 * SvelteKit's `$app/env/public` (static) is the direct equivalent of Next's
 * `NEXT_PUBLIC_*`: only variables declared public in `src/env.ts` can be
 * imported from it, and a static one is substituted at build time.
 */
export const STRAPI_URL = dev
  ? PUBLIC_STRAPI_DEV_API_URL
  : PUBLIC_STRAPI_PROD_API_URL

export function getStrapiURL() {
  return STRAPI_URL || 'http://localhost:1337'
}

export function getStrapiMedia(url: string | null) {
  if (url == null) return null
  if (url.startsWith('data:')) return url
  if (url.startsWith('http') || url.startsWith('//')) return url
  return `${getStrapiURL()}${url}`
}
