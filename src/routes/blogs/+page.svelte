<script lang="ts">
  import Search from '@lucide/svelte/icons/search'
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { cubicOut } from 'svelte/easing'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import FeaturedPost from '#components/blog/FeaturedPost.svelte'
  import PostCard from '#components/blog/PostCard.svelte'
  import {
    matchesQuery,
    toPostSummary,
    type PostSummary,
  } from '#components/blog/posts.js'
  import PageGlow from '#components/chrome/PageGlow.svelte'
  import PageHeader from '#components/ui/PageHeader.svelte'
  import { getAllArticles } from '#lib/devto.js'
  import { prefersReducedMotion } from '#lib/motion/index.js'
  import { reveal } from '#lib/motion/reveal.js'
  import { SITE_URL } from '#lib/site.js'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const title = 'Blog | Pranta Dutta'
  const description =
    'Notes from shipping: Flutter, mobile development, game monetisation, AI-assisted engineering and the occasional rant, by Pranta Dutta.'

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
  let refreshed = $state<PostSummary[] | null>(null)

  // Falls back to the prerendered payload until (and unless) the refresh lands,
  // and follows `data` automatically across client-side navigations.
  const posts = $derived(refreshed ?? data.posts)

  $effect(() => {
    let cancelled = false

    getAllArticles()
      .then((fresh) => {
        if (!cancelled && fresh.length > 0) refreshed = fresh.map(toPostSummary)
      })
      .catch(() => {
        /* keep the prerendered list */
      })

    return () => {
      cancelled = true
    }
  })

  // --- Search (?q=) ----------------------------------------------------------
  // The page is one static file, so the query is read in the browser after
  // mount: `page.url.searchParams` throws while prerendering.
  let query = $state('')

  let input = $state<HTMLInputElement>()

  onMount(() => {
    query = page.url.searchParams.get('q') ?? ''
  })

  const trimmed = $derived(query.trim())

  const results = $derived(
    trimmed ? posts.filter((post) => matchesQuery(post, trimmed)) : []
  )

  let syncTimer: ReturnType<typeof setTimeout> | undefined

  const onInput = (event: Event) => {
    query = (event.currentTarget as HTMLInputElement).value
    clearTimeout(syncTimer)

    syncTimer = setTimeout(() => {
      const url = new URL(window.location.href)

      if (query.trim()) url.searchParams.set('q', query.trim())
      else url.searchParams.delete('q')

      goto(url, { shallow: true, replace: true, state: page.state })
    }, 150)
  }

  const clear = () => {
    query = ''

    const url = new URL(window.location.href)

    url.searchParams.delete('q')
    goto(url, { shallow: true, replace: true, state: page.state })
  }

  const isTyping = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

  // `/` focuses the search here; everywhere else the layout uses it for the
  // command palette.
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey)
      return
    if (isTyping(event.target)) return

    event.preventDefault()
    input?.focus()
  }

  // Results reflow like the projects filter (MOTION §4 "Filters"): leaving
  // cards fade and shrink, entering ones rise, the rest FLIP into place.
  const enter = (_node: Element, { i }: { i: number }) => ({
    duration: prefersReducedMotion.current ? 0 : 320,
    delay: prefersReducedMotion.current ? 0 : Math.min(i, 8) * 40,
    easing: cubicOut,
    css: (t: number) =>
      `opacity: ${t}; transform: translateY(${(1 - t) * 12}px)`,
  })
  const leave = (_node: Element) => ({
    duration: prefersReducedMotion.current ? 0 : 200,
    easing: cubicOut,
    css: (t: number) => `opacity: ${t}; transform: scale(${0.96 + t * 0.04})`,
  })
  const flipOptions = () => ({
    duration: prefersReducedMotion.current ? 0 : 320,
    easing: cubicOut,
  })

  const featured = $derived(posts[0])
  const side = $derived(posts.slice(1, 5))
  const older = $derived(posts.slice(5))
</script>

<svelte:window onkeydown={onKeydown} />

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="{SITE_URL}/blogs" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="{SITE_URL}/blogs" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="og:image" content="{SITE_URL}/og/blogs.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:image" content="{SITE_URL}/og/blogs.png" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
</svelte:head>

<PageGlow
  glows={[
    {
      hue: 'orange',
      width: 700,
      height: 500,
      right: -200,
      top: -220,
      drift: 2,
    },
  ]}
/>

<div class="container-page page">
  <PageHeader
    command="$ cat ~/blog/*.md | wc -w → 125,000+ reads"
    title="Notes from shipping."
  >
    {#snippet aside()}
      <div class="search">
        <Search size={14} strokeWidth={1.75} aria-hidden="true" />
        <input
          bind:this={input}
          type="search"
          value={query}
          oninput={onInput}
          onkeydown={(event) => {
            if (event.key === 'Escape' && query) {
              event.preventDefault()
              clear()
            }
          }}
          placeholder="grep posts…"
          aria-label="Search posts by title or tag"
          autocomplete="off"
          spellcheck="false"
        />
        <span class="kbd" aria-hidden="true">/</span>
      </div>
    {/snippet}
  </PageHeader>

  <p class="sr-only" aria-live="polite">
    {trimmed
      ? `${results.length} ${results.length === 1 ? 'post matches' : 'posts match'}`
      : ''}
  </p>

  {#if trimmed}
    {#if results.length > 0}
      <ul class="results grid">
        {#each results as post, i (post.slug)}
          <li in:enter={{ i }} out:leave animate:flip={flipOptions()}>
            <PostCard {post} />
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty">
        <span class="prompt">$ grep -ri "{trimmed}" ~/blog</span>
        grep: no matches.
        <button type="button" class="reset" onclick={clear}>clear search</button
        >
      </p>
    {/if}
  {:else if featured}
    <div class="top">
      <div class="enter" style:--d="420ms">
        <FeaturedPost post={featured} />
      </div>
      <ul class="side">
        {#each side as post, i (post.slug)}
          <li class="enter" style:--d="{460 + i * 50}ms">
            <PostCard {post} named />
          </li>
        {/each}
      </ul>
    </div>

    {#if older.length}
      <section class="older" aria-labelledby="older-title">
        <h2 id="older-title" class="older-title">
          $ git log --skip=5 <span class="count"
            >· {older.length} older posts</span
          >
        </h2>
        <ul class="grid" use:reveal={{ stagger: true }}>
          {#each older as post (post.slug)}
            <li><PostCard {post} /></li>
          {/each}
        </ul>
      </section>
    {/if}
  {/if}
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 26px;
    padding-bottom: 48px;
  }

  .search {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 320px;
    padding: 0 14px;
    border-radius: 10px;
    background: var(--surface);
    border: 1px solid var(--border-strong);
    color: var(--ink-4);
    transition:
      border-color var(--dur-2) var(--ease-out),
      box-shadow var(--dur-2) var(--ease-out);
  }

  .search:focus-within {
    border-color: var(--blue);
    box-shadow: 0 0 0 4px color-mix(in oklch, var(--blue) 15%, transparent);
  }

  .search input {
    flex: 1;
    min-width: 0;
    height: 42px;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 13px;
    caret-color: var(--blue);
    appearance: none;
  }

  .search input::placeholder {
    color: var(--ink-4);
  }

  .search input::-webkit-search-cancel-button {
    display: none;
  }

  .search .kbd {
    padding: 1px 6px;
  }

  .top {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .side {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .older {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 8px;
  }

  .older-title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 400;
    color: var(--ink-3);
  }

  .older-title .count {
    color: var(--ink-4);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    margin: 0;
    padding: 28px;
    border-radius: 18px;
    border: 1px dashed var(--border-strong);
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--ink-2);
  }

  .prompt {
    color: var(--ink-4);
  }

  .reset {
    margin-top: 6px;
    color: var(--blue-ink);
    font: inherit;
    font-size: 13px;
  }

  .reset:hover {
    text-decoration: underline;
  }

  @media (max-width: 1023px) {
    .top {
      grid-template-columns: minmax(0, 1fr);
    }

    .search {
      width: 100%;
    }
  }

  @media (max-width: 767px) {
    .page {
      gap: 18px;
    }

    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
