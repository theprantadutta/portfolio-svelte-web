<script lang="ts">
  import Blogs from '$components/Blogs.svelte'
  import { getAllArticles } from '$lib/devto'
  import type { DevToArticle } from '$lib/types/blog-types'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const title = 'Blog | Pranta Dutta'
  const description =
    'Technical articles and insights about Flutter, mobile development, web technologies, and software engineering by Pranta Dutta.'
  const ogDescription =
    'Technical articles and insights about Flutter, mobile development, and software engineering.'

  /**
   * Stale-while-revalidate against dev.to.
   *
   * The prerendered list is whatever dev.to returned at build time, so a newly
   * published article would otherwise be invisible until the next deploy. The
   * dev.to articles endpoint is public and CORS-enabled, so the browser can
   * re-fetch it directly after paint and swap in a fresher list. Costs one
   * background request, gains publish-to-live with no rebuild.
   *
   * Failures are deliberately silent: the build-time list is already on screen
   * and correct enough, so a dev.to hiccup should change nothing the reader
   * sees.
   */
  let refreshed = $state<DevToArticle[] | null>(null)

  // Falls back to the prerendered payload until (and unless) the refresh lands,
  // and follows `data` automatically across client-side navigations.
  const articles = $derived(refreshed ?? data.articles)

  $effect(() => {
    let cancelled = false

    getAllArticles()
      .then((fresh) => {
        if (!cancelled && fresh.length > 0) refreshed = fresh
      })
      .catch(() => {
        /* keep the prerendered list */
      })

    return () => {
      cancelled = true
    }
  })
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://pranta.dev/blogs" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:url" content="https://pranta.dev/blogs" />
</svelte:head>

<main class="flex flex-col items-center px-4">
  <Blogs {articles} />
</main>
