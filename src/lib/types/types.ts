export type PlatformType =
  'android' | 'ios' | 'android-and-ios' | 'web' | 'cloud'

export type ProjectStatus = 'planned' | 'ongoing' | 'completed'

export type DeveloperRole =
  | 'solo'
  | 'small-team'
  | 'cross-functional'
  | 'feature-ownership'
  | 'freelance'
  | 'open-source'

export type FeatureFlag =
  | 'performant'
  | 'mobile-first'
  | 'cross-platform'
  | 'open-source'
  | 'production-ready'
  | 'well-documented'
  | 'secure'
  | 'modern-ui'
  | 'user-centered'
  | 'modern-dev'

export type ProjectDataAttributes = {
  id: number
  documentId: string
  title: string
  description: string
  longDescription?: any
  googlePlayLink?: string
  appStoreLink?: string
  githubLink?: string
  cover: IStrapiImageData
  Tags: {
    id: number
    name: string
  }[]
  /** The original screenshots field: upload order, optional since the CMS gained `screenshots` */
  imageUrls?: IStrapiImageData[] | null
  /** Ordered screenshots; when present they replace imageUrls */
  screenshots?: ProjectScreenshot[] | null
  sortBy: number
  slug: string
  // New fields from Strapi
  isFeatured: boolean
  platformType: PlatformType
  projectStatus: ProjectStatus
  complexity: number
  startDate: string
  endDate?: string
  accentColor?: string
  developerRole: DeveloperRole
  video?: IStrapiImageData[]
  features: {
    id: number
    flag: FeatureFlag
  }[]
  hidden?: boolean | null
  /** One short result for the project card, e.g. "fraud −99.99%" */
  metric?: string | null
  /** Up to three headline numbers for the pinned card and Impact panel */
  impactStats?: ImpactStat[] | null
  /** Rendered as `git log --oneline` on the project page */
  changelog?: ChangelogEntry[] | null
  updatedAt?: string
}

export interface ProjectScreenshot {
  id?: number
  /** Position on the site, lowest first */
  order?: number | null
  caption?: string | null
  image?: IStrapiImageData | null
}

export interface ImpactStat {
  id: number
  value: string
  label: string
  /** Rendered in green: the number is an improvement, e.g. "−40%" */
  highlight?: boolean | null
}

export type ChangelogType =
  'feat' | 'fix' | 'perf' | 'release' | 'init' | 'docs' | 'refactor' | 'chore'

export interface ChangelogEntry {
  id: number
  type: ChangelogType
  message: string
  /** ISO date */
  date: string
}

export interface IStrapiImageData {
  id: string
  formats: {
    large: IStrapiImageDataFormat
    small: IStrapiImageDataFormat
    thumbnail: IStrapiImageDataFormat
    medium: IStrapiImageDataFormat
  }
}

export interface IStrapiImageDataFormat {
  url: string
  height: number
  width: number
}

type Pagination = {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

type Meta = {
  pagination: Pagination
}

export interface IStrapiApiResponse<T> {
  data: T[]
  meta: Meta
}

export interface IStrapiApiSingleResponse<T> {
  data: T
  meta: Meta
}
