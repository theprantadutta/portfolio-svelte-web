import { error } from '@sveltejs/kit'

import { getAllArticles, getArticleBySlug } from '$lib/devto'
import { shortHash } from '$lib/hash'
import { emptyReactionCounts } from '$lib/reactions'
import { countWords, processArticleHtml } from '$lib/server/article-html'
import { getAllReactionCounts } from '$lib/server/strapi'
import type { EntryGenerator, PageServerLoad } from './$types'

/**
 * `'auto'` is the direct equivalent of Next's `dynamicParams = true`.
 *
 * Every article that existed at build time is written out as a static file by
 * the `entries` generator below and served straight off disk. An article
 * published *since* the last deploy still resolves — it falls through to the
 * Node server, which renders it once on demand. Without this, the /blogs
 * client-side refresh would surface fresh articles as links to a 404.
 *
 * This is the only page in the app that can render at request time, and only
 * for posts newer than the current build.
 */
export const prerender = 'auto'

export const entries: EntryGenerator = async () => {
  const articles = await getAllArticles()
  return articles.map((article) => ({ slug: article.slug }))
}

export const load: PageServerLoad = async ({ params, fetch }) => {
  // Transient fetch errors propagate on purpose: getArticleBySlug only returns
  // null when dev.to confirms a real 404, so a rate-limit blip fails the build
  // loudly instead of baking a live article as a permanent 404 page.
  const article = await getArticleBySlug(params.slug, fetch)

  if (!article) {
    error(404, 'Blog post not found')
  }

  // Reaction counts are a garnish: the page refreshes them after paint, and a
  // post rendered on demand at runtime has no build-time CMS key at all. So a
  // failure here renders zeros instead of failing the page.
  let reactions = emptyReactionCounts()
  try {
    reactions =
      (await getAllReactionCounts({ fetch })).get(article.slug) ?? reactions
  } catch (reason) {
    console.warn(
      `[blog] reaction counts unavailable for ${article.slug}:`,
      reason
    )
  }

  const { html, toc } = processArticleHtml(article.body_html)

  return {
    post: {
      slug: article.slug,
      title: article.title,
      description: article.description,
      url: article.url,
      hash: shortHash(article.slug),
      publishedAt: article.published_at,
      editedAt: article.edited_at ?? article.published_at,
      minutes: article.reading_time_minutes,
      words: countWords(article.body_markdown ?? ''),
      tags: article.tag_list,
      cover: article.cover_image,
      socialImage: article.social_image,
    },
    html,
    toc,
    reactions,
  }
}
