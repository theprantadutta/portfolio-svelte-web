/**
 * Blog post reactions, shared by the post page, the /api/reactions endpoint
 * and the Strapi client. Counts live in the CMS's post-reaction collection;
 * which reactions this visitor has toggled lives in their localStorage.
 */

export const REACTIONS = [
  { id: 'heart', emoji: '❤️', label: 'Love it' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'rocket', emoji: '🚀', label: 'Ship it' },
  { id: 'eyes', emoji: '👀', label: 'Watching' },
] as const

export type ReactionEmoji = (typeof REACTIONS)[number]['id']

export type ReactionCounts = Record<ReactionEmoji, number>

export const emptyReactionCounts = (): ReactionCounts => ({
  heart: 0,
  fire: 0,
  rocket: 0,
  eyes: 0,
})

export const isReactionEmoji = (value: unknown): value is ReactionEmoji =>
  REACTIONS.some((reaction) => reaction.id === value)

/** dev.to slugs: lowercase words and a trailing id, joined by hyphens. */
export const REACTION_SLUG = /^[a-z0-9][a-z0-9-]{0,199}$/
