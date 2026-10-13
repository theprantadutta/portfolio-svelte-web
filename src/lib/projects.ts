import { getStrapiMedia } from '$lib/constants/urls'
import { shortHash } from '$lib/hash'
import type {
  ChangelogType,
  IStrapiImageData,
  ImpactStat,
  PlatformType,
  ProjectDataAttributes,
} from '$lib/types/types'

/**
 * Turns CMS projects into what the redesign renders. Everything here is
 * derived from fields the CMS already has (platform, tags, dates, status), so
 * a new project in Strapi shows up correctly categorised with no extra data
 * entry. Only `metric`, `impactStats` and `changelog` are authored for the
 * redesign, and all three are optional.
 */

export const PROJECT_FILTERS = ['All', 'Mobile', 'Backend', 'AI'] as const
export type ProjectFilter = (typeof PROJECT_FILTERS)[number]
export type ProjectCategory = Exclude<ProjectFilter, 'All'>

export type ProjectKind = 'mobile' | 'web' | 'infra' | 'game' | 'cli'
export type ProjectStatusLabel = 'live' | 'in progress' | 'planned'

export interface ImageRef {
  url: string
  width: number
  height: number
  /** Strapi's own size variants, as a srcset */
  srcset?: string
}

export interface ProjectSummary {
  slug: string
  title: string
  description: string
  hash: string
  kind: ProjectKind
  categories: ProjectCategory[]
  /** Programming languages implied by the tags, most significant first */
  languages: string[]
  /** Tags that are not languages: frameworks, services, hardware */
  stack: string[]
  metric: string | null
  impactStats: ImpactStat[]
  status: ProjectStatusLabel
  year: string
  isFeatured: boolean
  cover: ImageRef | null
  screenshots: ImageRef[]
}

const MOBILE_PLATFORMS: PlatformType[] = ['android', 'ios', 'android-and-ios']

const lower = (values: string[]) => new Set(values.map((v) => v.toLowerCase()))

const AI_TAGS = lower([
  'AI',
  'LLM',
  'LLM Gateway',
  'Gemini',
  'MCP',
  'OpenRouter',
])
const BACKEND_TAGS = lower([
  'ASP.NET Core',
  'ASP.NET Core Web API',
  '.NET 10',
  'C#',
  'Go',
  'Golang',
  'Node.js',
  'SignalR',
  'Rust',
  'PostgreSQL',
  'SQL Server',
  'Redis',
])
const GAME_TAGS = lower(['Game', 'Flame'])

/** Tag → the language it is written in. First match is the primary one. */
const LANGUAGE_BY_TAG: Record<string, string> = {
  flutter: 'Dart',
  dart: 'Dart',
  flame: 'Dart',
  riverpod: 'Dart',
  'react native': 'TypeScript',
  typescript: 'TypeScript',
  'next.js': 'TypeScript',
  angular: 'TypeScript',
  svelte: 'TypeScript',
  'asp.net core': 'C#',
  'asp.net core web api': 'C#',
  '.net 10': 'C#',
  'c#': 'C#',
  rust: 'Rust',
  go: 'Go',
  golang: 'Go',
  kotlin: 'Kotlin',
  python: 'Python',
}

/** Tags that only restate a language or a category, hidden from stack lists. */
const REDUNDANT_TAGS = lower([
  'Dart',
  'C#',
  'TypeScript',
  'Game',
  'AI',
  'Cloud',
])

/**
 * Each language's dot colour, as a CSS variable from the design tokens. The
 * design fixes Dart, C#, Go, TypeScript and Kotlin; the rest reuse the
 * remaining accents so the languages bar never repeats a colour.
 */
export const LANGUAGE_COLORS: Record<string, string> = {
  Dart: 'var(--blue)',
  'C#': 'var(--purple)',
  Go: 'var(--cyan)',
  TypeScript: 'var(--indigo)',
  Kotlin: 'var(--orange)',
  Rust: 'var(--red)',
  'C++': 'var(--green)',
}

export const languageColor = (language: string) =>
  LANGUAGE_COLORS[language] ?? 'var(--lang-other)'

export const tagNames = (project: Pick<ProjectDataAttributes, 'Tags'>) =>
  (project.Tags ?? []).map((tag) => tag.name.trim())

export const projectCategories = (
  project: Pick<ProjectDataAttributes, 'Tags' | 'platformType'>
): ProjectCategory[] => {
  const tags = lower(tagNames(project))
  const has = (set: Set<string>) => [...tags].some((tag) => set.has(tag))

  const categories: ProjectCategory[] = []
  if (MOBILE_PLATFORMS.includes(project.platformType)) categories.push('Mobile')
  if (
    project.platformType === 'web' ||
    project.platformType === 'cloud' ||
    has(BACKEND_TAGS)
  ) {
    categories.push('Backend')
  }
  if (has(AI_TAGS)) categories.push('AI')
  return categories
}

export const projectKind = (
  project: Pick<ProjectDataAttributes, 'Tags' | 'platformType'>
): ProjectKind => {
  const tags = lower(tagNames(project))
  if ([...tags].some((tag) => GAME_TAGS.has(tag))) return 'game'
  if (tags.has('cli')) return 'cli'
  if (project.platformType === 'cloud') return 'infra'
  if (project.platformType === 'web') return 'web'
  return 'mobile'
}

export const projectLanguages = (
  project: Pick<ProjectDataAttributes, 'Tags'>
) => {
  const languages: string[] = []
  for (const tag of tagNames(project)) {
    const language = LANGUAGE_BY_TAG[tag.toLowerCase()]
    if (language && !languages.includes(language)) languages.push(language)
  }
  return languages
}

export const projectStack = (project: Pick<ProjectDataAttributes, 'Tags'>) =>
  tagNames(project).filter((tag) => !REDUNDANT_TAGS.has(tag.toLowerCase()))

export const projectStatus = (
  project: Pick<ProjectDataAttributes, 'projectStatus'>
): ProjectStatusLabel =>
  project.projectStatus === 'completed'
    ? 'live'
    : project.projectStatus === 'ongoing'
      ? 'in progress'
      : 'planned'

const yearOf = (date?: string | null) => (date ? date.slice(0, 4) : '')

/** Builds a srcset from the size variants Strapi generated for an upload. */
export const toImageRef = (
  image:
    | (IStrapiImageData & { url?: string; width?: number; height?: number })
    | null
    | undefined
): ImageRef | null => {
  if (!image) return null
  const formats = image.formats ?? ({} as IStrapiImageData['formats'])
  const variants = [
    formats.thumbnail,
    formats.small,
    formats.medium,
    formats.large,
  ]
    .filter((f) => f?.url && f?.width)
    .sort((a, b) => a.width - b.width)

  const url = getStrapiMedia(image.url ?? variants.at(-1)?.url ?? null)
  if (!url) return null

  const width = image.width ?? variants.at(-1)?.width ?? 0
  const height = image.height ?? variants.at(-1)?.height ?? 0
  const candidates = [
    ...variants.map((f) => ({ url: getStrapiMedia(f.url)!, width: f.width })),
    { url, width },
  ].filter(
    (c, i, all) => c.width && all.findIndex((o) => o.width === c.width) === i
  )

  return {
    url,
    width,
    height,
    srcset:
      candidates.length > 1
        ? candidates.map((c) => `${c.url} ${c.width}w`).join(', ')
        : undefined,
  }
}

const isImage = (media: { url?: string; mime?: string }) =>
  media.mime
    ? media.mime.startsWith('image/')
    : !/\.(mp4|webm|mov)$/i.test(media.url ?? '')

export const toProjectSummary = (
  project: ProjectDataAttributes
): ProjectSummary => {
  const screenshots = (project.imageUrls ?? [])
    .filter((media) => isImage(media as { url?: string; mime?: string }))
    .map((media) => toImageRef(media))
    .filter((ref): ref is ImageRef => ref !== null)

  return {
    slug: project.slug,
    title: project.title,
    description: project.description,
    hash: shortHash(project.slug),
    kind: projectKind(project),
    categories: projectCategories(project),
    languages: projectLanguages(project),
    stack: projectStack(project),
    metric: project.metric?.trim() || null,
    impactStats: project.impactStats ?? [],
    status: projectStatus(project),
    year: yearOf(project.startDate),
    isFeatured: Boolean(project.isFeatured),
    cover: toImageRef(project.cover),
    screenshots,
  }
}

export interface ChangelogRow {
  hash: string
  type: ChangelogType
  message: string
  year: string
  date: string
}

/**
 * The project page's `git log --oneline`. Authored entries from the CMS win;
 * without them it is derived from the project's own dates, so every project
 * has at least its first commit and, once shipped, its release.
 */
export const projectChangelog = (
  project: ProjectDataAttributes
): ChangelogRow[] => {
  const row = (
    type: ChangelogType,
    message: string,
    date: string
  ): ChangelogRow => ({
    hash: shortHash(`${project.slug}:${type}:${message}`),
    type,
    message,
    date,
    year: yearOf(date),
  })

  if (project.changelog?.length) {
    return [...project.changelog]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((entry) => row(entry.type, entry.message, entry.date))
  }

  const rows: ChangelogRow[] = []
  // Some CMS entries have an end date before their start date; those are
  // data errors (listed in TODO_CONTENT.md), so no release row is invented.
  if (
    project.projectStatus === 'completed' &&
    project.endDate &&
    project.endDate >= project.startDate
  ) {
    rows.push(row('release', `${project.title} shipped`, project.endDate))
  }
  if (project.startDate)
    rows.push(row('init', 'first commit', project.startDate))
  return rows
}

/** Lane colour for each changelog type: feat green, perf blue, init orange… */
export const CHANGELOG_COLORS: Record<ChangelogType, string> = {
  feat: 'var(--green)',
  fix: 'var(--red)',
  perf: 'var(--blue)',
  release: 'var(--purple)',
  init: 'var(--orange)',
  docs: 'var(--orange)',
  refactor: 'var(--cyan)',
  chore: 'var(--ink-4)',
}

export const CHANGELOG_INK: Record<ChangelogType, string> = {
  feat: 'var(--green-ink)',
  fix: 'var(--red-ink)',
  perf: 'var(--blue-ink)',
  release: 'var(--purple-ink)',
  init: 'var(--orange-ink)',
  docs: 'var(--orange-ink)',
  refactor: 'var(--blue-ink)',
  chore: 'var(--ink-3)',
}

/** Projects published on a store, which is what "public apps" counts. */
export const isPublicApp = (
  project: Pick<ProjectDataAttributes, 'googlePlayLink' | 'appStoreLink'>
) => Boolean(project.googlePlayLink || project.appStoreLink)
