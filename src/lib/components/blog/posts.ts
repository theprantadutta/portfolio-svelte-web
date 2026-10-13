import { shortHash } from '$lib/hash'
import type { DevToArticle } from '$lib/types/blog-types'

/**
 * What the blog list renders for each post: the slice of a dev.to article
 * the cards use, so the prerendered page doesn't carry every field dev.to
 * returns (user objects, canonical URLs, timestamps) 66 times over.
 *
 * Shared by the server load and the browser's refresh against dev.to, so a
 * post looks the same whichever of the two produced it.
 */
export interface PostSummary {
  slug: string
  title: string
  description: string
  hash: string
  /** ISO timestamp */
  publishedAt: string
  minutes: number
  tags: string[]
  cover: string
}

export const toPostSummary = (article: DevToArticle): PostSummary => ({
  slug: article.slug,
  title: article.title,
  description: article.description,
  hash: shortHash(article.slug),
  publishedAt: article.published_at,
  minutes: article.reading_time_minutes,
  tags: Array.isArray(article.tag_list) ? article.tag_list : [],
  // dev.to generates a social card for every post, so there is always an
  // image even when the author set no cover.
  cover: article.cover_image ?? article.social_image,
})

/**
 * "Oct 2" for this year's posts and "Oct 6 '25" for older ones, the way
 * dev.to writes them. Formatted in UTC so the server and browser agree.
 */
export const postDate = (iso: string, now = new Date()) => {
  const date = new Date(iso)
  const day = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  return date.getUTCFullYear() === now.getUTCFullYear()
    ? day
    : `${day} '${String(date.getUTCFullYear()).slice(2)}`
}

/** Live search over titles and tags: every word must match somewhere. */
export const matchesQuery = (post: PostSummary, query: string) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const haystack =
    `${post.title} ${post.tags.map((t) => `#${t}`).join(' ')}`.toLowerCase()
  return words.every((word) => haystack.includes(word.replace(/^#/, '')))
}

/** One heading in a post's table of contents. */
export interface TocEntry {
  id: string
  text: string
  /** 2 for sections, 3 for subsections */
  level: 2 | 3
}
