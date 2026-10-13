import { STRAPI_INTERNAL_URL, STRAPI_API_KEY } from '$app/env/private'
import { STRAPI_URL } from '#lib/constants/urls.js'
import { createMemo } from '#lib/memo.js'
import {
  emptyReactionCounts,
  type ReactionCounts,
  type ReactionEmoji,
} from '#lib/reactions.js'
import type {
  IStrapiApiResponse,
  ProjectDataAttributes,
} from '#lib/types/types.js'

/**
 * Server-only Strapi origin used for data fetching.
 *
 * On the VPS the web and CMS containers share the external `proxy` network, so
 * `STRAPI_INTERNAL_URL` can point straight at the Strapi container
 * (http://portfolio-strapi-cms:1337) and skip the public roundtrip + TLS.
 *
 * `$app/env/private` is read at runtime and is only importable from server
 * modules, which is what keeps the internal hostname out of the browser bundle.
 * Living under `src/lib/server/` makes that a build-time guarantee: SvelteKit
 * fails the build if a client module ever imports this file.
 *
 * During `docker build` the builder is not attached to the `proxy` network, so
 * the variable is unset there and this falls back to the public URL — the same
 * arrangement the Next build used.
 */
export const STRAPI_SERVER_URL = STRAPI_INTERNAL_URL || STRAPI_URL

export const STRAPI_API_URL = `${STRAPI_SERVER_URL}/api`

type SearchParamValue = string | number | boolean | null | undefined

type SearchParams =
  Record<string, SearchParamValue | SearchParamValue[]> | URLSearchParams

interface StrapiFetchOptions {
  searchParams?: SearchParams
  /**
   * SvelteKit's `fetch` during prerendering. Passing it lets the framework
   * dedupe and record the request; falls back to global fetch when omitted.
   */
  fetch?: typeof globalThis.fetch
  /** Overrides the build-time read-only key, e.g. for the reactions token. */
  token?: string
  method?: 'GET' | 'POST'
  body?: unknown
}

/** A non-2xx answer from Strapi, with the status kept for callers to test. */
export class StrapiError extends Error {
  constructor(
    readonly status: number,
    statusText: string
  ) {
    super(`Strapi request failed – ${status} ${statusText}`)
  }
}

const buildSearchParams = (params?: SearchParams) => {
  if (!params) return ''

  if (params instanceof URLSearchParams) {
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item))
        }
      })
      return
    }

    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()

  return queryString ? `?${queryString}` : ''
}

const strapiFetch = async <T>(
  path: string,
  {
    searchParams,
    fetch: fetchFn = globalThis.fetch,
    token = STRAPI_API_KEY,
    method = 'GET',
    body,
  }: StrapiFetchOptions = {}
) => {
  const url = `${STRAPI_API_URL}${path}${buildSearchParams(searchParams)}`

  const response = await fetchFn(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    throw new StrapiError(response.status, response.statusText)
  }

  return (await response.json()) as T
}

/**
 * Strapi's REST API pages at 25 by default (`config/api.ts` in the CMS), and
 * the site shows every project, so every list asks for the configured
 * maximum. Before this was set, a 26th project would have silently gone
 * missing from the site.
 */
const PAGE_SIZE = 100

/** Prerendering dedupes on these keys; see `createMemo`. */
const memo = createMemo(10 * 60 * 1000)

const visible = {
  'filters[$or][0][hidden][$eq]': 'false',
  'filters[$or][1][hidden][$null]': 'true',
}

const listFields = [
  'id',
  'documentId',
  'title',
  'description',
  'googlePlayLink',
  'githubLink',
  'sortBy',
  'slug',
  'isFeatured',
  'platformType',
  'projectStatus',
  'complexity',
  'startDate',
  'endDate',
  'accentColor',
  'developerRole',
  'appStoreLink',
  'updatedAt',
]

/**
 * Fields added to the CMS for the redesign. A CMS that has not been migrated
 * yet answers 400 to a query naming them, so lists retry without them (see
 * withRedesignFields) and the site renders, just without metrics and impact
 * numbers, until the CMS deploy lands.
 */
const redesignFields = {
  // The next free index: qs reads a sparse one like fields[100] as an object,
  // which Strapi rejects.
  [`fields[${listFields.length}]`]: 'metric',
  'populate[impactStats]': 'true',
}

const withRedesignFields = async <T>(
  query: (extra: Record<string, string>) => Promise<T>
): Promise<T> => {
  try {
    return await query(redesignFields)
  } catch (error) {
    if (!(error instanceof StrapiError) || error.status !== 400) throw error
    console.warn(
      '[strapi] The CMS rejected the redesign fields (metric, impactStats); deploy portfolio-strapi-cms. Rendering without them.'
    )
    return query({})
  }
}

const media = (field: string) => ({
  [`populate[${field}][fields][0]`]: 'url',
  [`populate[${field}][fields][1]`]: 'formats',
  [`populate[${field}][fields][2]`]: 'width',
  [`populate[${field}][fields][3]`]: 'height',
})

/**
 * Every visible project, in the CMS's sort order, with what the project list,
 * the pinned card, the skills tooltips and the search index need. The long
 * rich-text description is left out; only the project page reads it.
 */
export const getAllProjects = (options?: StrapiFetchOptions) =>
  memo('projects', () =>
    withRedesignFields((extra) =>
      strapiFetch<IStrapiApiResponse<ProjectDataAttributes>>('/projects', {
        ...options,
        searchParams: {
          sort: 'sortBy:asc',
          'pagination[pageSize]': PAGE_SIZE,
          ...visible,
          ...Object.fromEntries(
            listFields.map((field, i) => [`fields[${i}]`, field])
          ),
          'populate[Tags][fields][0]': 'name',
          ...media('cover'),
          ...media('imageUrls'),
          'populate[features][fields][0]': 'flag',
          ...extra,
        },
      })
    )
  )

export interface ProjectSlugEntry {
  slug: string
  updatedAt?: string
}

/**
 * Every visible project's slug, plus when it last changed.
 *
 * Drives both the prerendering of /projects/[slug] and <lastmod> in the
 * sitemap, so the two can never disagree about which pages exist.
 */
export const getAllProjectSlugs = async (
  options?: StrapiFetchOptions
): Promise<ProjectSlugEntry[]> => {
  const response = await getAllProjects(options)

  return response.data
    .filter((project) => project.slug)
    .map(({ slug, updatedAt }) => ({ slug, updatedAt }))
}

/** A single visible project by slug, or null when there genuinely isn't one. */
export const getProjectBySlug = async (
  slug: string,
  options?: StrapiFetchOptions
): Promise<ProjectDataAttributes | null> => {
  const response = await strapiFetch<{ data: ProjectDataAttributes[] }>(
    '/projects',
    {
      ...options,
      searchParams: {
        'filters[slug][$eq]': slug,
        ...visible,
        // `*` covers media and components one level deep, which is every
        // field the project page renders, impactStats and changelog included.
        populate: '*',
      },
    }
  )

  // Genuinely no such (visible) project — a real 404, not an error. A transport
  // or HTTP failure already threw inside strapiFetch, so the build fails loudly
  // with the status instead of silently prerendering a 404 page.
  if (!response.data || response.data.length === 0) return null

  return response.data[0]
}

interface ReactionRow {
  slug: string
  emoji: ReactionEmoji
  count: number
}

const sumReactions = (
  rows: ReactionRow[],
  into: Map<string, ReactionCounts>
) => {
  for (const row of rows) {
    const entry = into.get(row.slug) ?? emptyReactionCounts()
    entry[row.emoji] += row.count
    into.set(row.slug, entry)
  }
  return into
}

/**
 * Every post's reaction counts, keyed by slug, read once per build so each
 * prerendered post ships with current numbers. The browser refreshes them
 * from /api/reactions after paint.
 *
 * A 404 means the CMS predates the post-reaction collection. That is not
 * worth failing a build over, since posts render fine with zero counts and
 * the live refresh fills them in, so it degrades with a warning. Anything
 * else still throws.
 */
export const getAllReactionCounts = (options?: StrapiFetchOptions) =>
  memo('reactions', async () => {
    const counts = new Map<string, ReactionCounts>()
    let page = 1
    let pageCount = 1

    try {
      do {
        const response = await strapiFetch<IStrapiApiResponse<ReactionRow>>(
          '/post-reactions',
          {
            ...options,
            searchParams: {
              'fields[0]': 'slug',
              'fields[1]': 'emoji',
              'fields[2]': 'count',
              'pagination[page]': page,
              'pagination[pageSize]': PAGE_SIZE,
            },
          }
        )
        sumReactions(response.data, counts)
        pageCount = response.meta.pagination.pageCount
        page++
      } while (page <= pageCount)
    } catch (error) {
      if (error instanceof StrapiError && error.status === 404) {
        console.warn(
          '[strapi] /api/post-reactions does not exist yet, so posts show zero reactions until the CMS is deployed.'
        )
        return counts
      }
      throw error
    }

    return counts
  })

/** One post's counts, read live with the runtime reactions token. */
export const getReactionCounts = async (
  slug: string,
  token: string
): Promise<ReactionCounts> => {
  const response = await strapiFetch<IStrapiApiResponse<ReactionRow>>(
    '/post-reactions',
    {
      token,
      searchParams: {
        'filters[slug][$eq]': slug,
        'fields[0]': 'slug',
        'fields[1]': 'emoji',
        'fields[2]': 'count',
        'pagination[pageSize]': PAGE_SIZE,
      },
    }
  )

  return (
    sumReactions(response.data, new Map()).get(slug) ?? emptyReactionCounts()
  )
}

/** Adds +1 or -1 to one emoji on one post and returns the post's new counts. */
export const react = async (
  slug: string,
  emoji: ReactionEmoji,
  delta: 1 | -1,
  token: string
): Promise<ReactionCounts> => {
  const response = await strapiFetch<{
    data: { slug: string; counts: ReactionCounts }
  }>('/post-reactions/react', {
    token,
    method: 'POST',
    body: { slug, emoji, delta },
  })
  return response.data.counts
}
