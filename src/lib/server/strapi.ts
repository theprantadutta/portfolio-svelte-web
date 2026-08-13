import { env } from '$env/dynamic/private'
import { STRAPI_URL } from '$lib/constants/urls'
import type {
  IStrapiApiResponse,
  ExperienceDataAttributes,
  ProjectDataAttributes,
  SkillDataAttributes,
} from '$lib/types/types'

/**
 * Server-only Strapi origin used for data fetching.
 *
 * On the VPS the web and CMS containers share the external `proxy` network, so
 * `STRAPI_INTERNAL_URL` can point straight at the Strapi container
 * (http://portfolio-strapi-cms:1337) and skip the public roundtrip + TLS.
 *
 * `$env/dynamic/private` is read at runtime and is only importable from server
 * modules, which is what keeps the internal hostname out of the browser bundle.
 * Living under `src/lib/server/` makes that a build-time guarantee: SvelteKit
 * fails the build if a client module ever imports this file.
 *
 * During `docker build` the builder is not attached to the `proxy` network, so
 * the variable is unset there and this falls back to the public URL — the same
 * arrangement the Next build used.
 */
export const STRAPI_SERVER_URL = env.STRAPI_INTERNAL_URL || STRAPI_URL
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
}

const defaultHeaders = () => ({
  Authorization: `Bearer ${env.STRAPI_API_KEY}`,
  'Content-Type': 'application/json',
})

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
  { searchParams, fetch: fetchFn = globalThis.fetch }: StrapiFetchOptions = {}
) => {
  const url = `${STRAPI_API_URL}${path}${buildSearchParams(searchParams)}`

  const response = await fetchFn(url, { headers: defaultHeaders() })

  if (!response.ok) {
    throw new Error(
      `Strapi request failed – ${response.status} ${response.statusText}`
    )
  }

  return (await response.json()) as T
}

export const getAllExperiences = (options?: StrapiFetchOptions) =>
  strapiFetch<IStrapiApiResponse<ExperienceDataAttributes>>('/experiences', {
    ...options,
    searchParams: {
      sort: 'sortBy:asc',
      'fields[0]': 'id',
      'fields[1]': 'title',
      'fields[2]': 'location',
      'fields[3]': 'description',
      'fields[4]': 'date',
      'fields[5]': 'sortBy',
    },
  })

export const getAllFeaturedProjects = (options?: StrapiFetchOptions) =>
  strapiFetch<IStrapiApiResponse<ProjectDataAttributes>>('/projects', {
    ...options,
    searchParams: {
      sort: 'sortBy:asc',
      'filters[isFeatured][$eq]': 'true',
      'filters[$or][0][hidden][$eq]': 'false',
      'filters[$or][1][hidden][$null]': 'true',
      'fields[0]': 'id',
      'fields[1]': 'documentId',
      'fields[2]': 'title',
      'fields[3]': 'description',
      'fields[4]': 'googlePlayLink',
      'fields[5]': 'githubLink',
      'fields[6]': 'sortBy',
      'fields[7]': 'slug',
      'fields[8]': 'isFeatured',
      'fields[9]': 'platformType',
      'fields[10]': 'projectStatus',
      'fields[11]': 'complexity',
      'fields[12]': 'startDate',
      'fields[13]': 'endDate',
      'fields[14]': 'accentColor',
      'fields[15]': 'developerRole',
      'fields[16]': 'appStoreLink',
      'populate[Tags][fields][0]': 'id',
      'populate[Tags][fields][1]': 'name',
      'populate[cover][fields][0]': 'formats',
      'populate[cover][fields][1]': 'url',
      'populate[imageUrls][fields][0]': 'formats',
      'populate[imageUrls][fields][1]': 'url',
      'populate[video][fields][0]': 'formats',
      'populate[video][fields][1]': 'url',
      'populate[features][fields][0]': 'id',
      'populate[features][fields][1]': 'flag',
    },
  })

export const getAllProjects = (options?: StrapiFetchOptions) =>
  strapiFetch<IStrapiApiResponse<ProjectDataAttributes>>('/projects', {
    ...options,
    searchParams: {
      sort: 'sortBy:asc',
      'filters[$or][0][hidden][$eq]': 'false',
      'filters[$or][1][hidden][$null]': 'true',
      'fields[0]': 'id',
      'fields[1]': 'documentId',
      'fields[2]': 'title',
      'fields[3]': 'description',
      'fields[4]': 'longDescription',
      'fields[5]': 'googlePlayLink',
      'fields[6]': 'githubLink',
      'fields[7]': 'sortBy',
      'fields[8]': 'slug',
      'fields[9]': 'isFeatured',
      'fields[10]': 'platformType',
      'fields[11]': 'projectStatus',
      'fields[12]': 'complexity',
      'fields[13]': 'startDate',
      'fields[14]': 'endDate',
      'fields[15]': 'accentColor',
      'fields[16]': 'developerRole',
      'fields[17]': 'appStoreLink',
      'populate[Tags][fields][0]': 'id',
      'populate[Tags][fields][1]': 'name',
      'populate[cover][fields][0]': 'formats',
      'populate[cover][fields][1]': 'url',
      'populate[imageUrls][fields][0]': 'formats',
      'populate[imageUrls][fields][1]': 'url',
      'populate[video][fields][0]': 'formats',
      'populate[video][fields][1]': 'url',
      'populate[features][fields][0]': 'id',
      'populate[features][fields][1]': 'flag',
    },
  })

export const getAllSkills = (options?: StrapiFetchOptions) =>
  strapiFetch<IStrapiApiResponse<SkillDataAttributes>>('/skills', {
    ...options,
    searchParams: {
      sort: 'title:asc',
      'fields[0]': 'id',
      'fields[1]': 'title',
      'fields[2]': 'rating',
      'fields[3]': 'isFavourite',
    },
  })

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
  const response = await strapiFetch<{ data: ProjectSlugEntry[] }>(
    '/projects',
    {
      ...options,
      searchParams: {
        'fields[0]': 'slug',
        // Explicit field selection means updatedAt has to be asked for. It
        // feeds <lastmod> in the sitemap.
        'fields[1]': 'updatedAt',
        'filters[$or][0][hidden][$eq]': 'false',
        'filters[$or][1][hidden][$null]': 'true',
      },
    }
  )

  return response.data.filter((project) => project.slug)
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
        'filters[$or][0][hidden][$eq]': 'false',
        'filters[$or][1][hidden][$null]': 'true',
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
