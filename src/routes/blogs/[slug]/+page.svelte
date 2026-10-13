<script lang="ts">
  import ArticleBody from '$components/blog/ArticleBody.svelte'
  import { postDate } from '$components/blog/posts'
  import Reactions from '$components/blog/Reactions.svelte'
  import { PostReactions } from '$components/blog/post-reactions.svelte'
  import ReadingProgress from '$components/blog/ReadingProgress.svelte'
  import Toc from '$components/blog/Toc.svelte'
  import DevToImage from '$components/DevToImage.svelte'
  import Avatar from '$components/ui/Avatar.svelte'
  import { SITE_URL } from '$lib/site'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const post = $derived(data.post)
  const canonical = $derived(`${SITE_URL}/blogs/${post.slug}`)
  const published = $derived(postDate(post.publishedAt))
  const edited = $derived(postDate(post.editedAt))
  const shareImage = $derived(post.cover ?? post.socialImage)

  // A fresh set per post, so moving between posts never carries counts over.
  const reactions = $derived(new PostReactions(data.post.slug, data.reactions))
  $effect(() => {
    reactions.hydrate()
  })

  // --- Which section is being read ------------------------------------------
  // A heading becomes current once it rises past ~45% of the viewport. The
  // observer's thin band (MOTION §4 "Table of contents") says when one has
  // crossed; the check itself reads positions so a fast fling or a jump from
  // the TOC can't leave the marker behind.
  let body = $state<HTMLElement>()
  let active = $state('intro')

  $effect(() => {
    void data.post.slug
    if (!body) return
    const headings = Array.from(
      body.querySelectorAll<HTMLElement>('h2[id], h3[id]')
    )
    const tracked = new Set(data.toc.map((entry) => entry.id))

    const pick = () => {
      const line = window.innerHeight * 0.45
      let current = 'intro'
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > line) break
        if (tracked.has(heading.id)) current = heading.id
      }
      active = current
    }

    const observer = new IntersectionObserver(pick, {
      rootMargin: '-40% 0px -55% 0px',
    })
    headings.forEach((heading) => observer.observe(heading))
    window.addEventListener('scrollend', pick)
    pick()

    return () => {
      observer.disconnect()
      window.removeEventListener('scrollend', pick)
    }
  })
</script>

<svelte:head>
  <title>{post.title} | Pranta Dutta</title>
  <meta name="description" content={post.description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={shareImage} />
  <meta property="article:published_time" content={post.publishedAt} />
  <meta property="article:modified_time" content={post.editedAt} />
  <meta property="article:author" content="Pranta Dutta" />
  {#each post.tags as tag (tag)}
    <meta property="article:tag" content={tag} />
  {/each}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={post.title} />
  <meta name="twitter:description" content={post.description} />
  <meta name="twitter:image" content={shareImage} />
</svelte:head>

<ReadingProgress target={body} />

<div class="container-page page">
  <div class="layout">
    <aside class="left" aria-label="Table of contents">
      {#if data.toc.length}
        <div class="enter sticky" style:--d="200ms">
          <Toc entries={data.toc} {active} variant="sidebar" />
        </div>
      {/if}
    </aside>

    <article class="main">
      {#if post.tags.length}
        <ul class="tags enter" style:--d="80ms" aria-label="Tags">
          {#each post.tags.slice(0, 4) as tag (tag)}
            <li class="chip">#{tag}</li>
          {/each}
        </ul>
      {/if}

      <h1 class="title" style:view-transition-name="post-title-{post.slug}">
        {post.title}
      </h1>

      <p class="byline enter" style:--d="160ms">
        <Avatar size={28} />
        <span
          >Pranta Dutta · <time datetime={post.publishedAt}>{published}</time> · {post.minutes}
          min read</span
        >
      </p>
      <p class="meta-m">
        <time datetime={post.publishedAt}>{published}</time> · {post.minutes} min
        · {post.hash}
      </p>

      {#if data.toc.length}
        <div class="toc-pill">
          <Toc entries={data.toc} {active} variant="pill" />
        </div>
      {/if}

      {#if post.cover}
        <figure
          class="cover"
          style:view-transition-name="post-cover-{post.slug}"
        >
          <DevToImage
            src={post.cover}
            alt=""
            priority
            class="cover-img"
            sizes="(max-width: 1023px) 100vw, 640px"
          />
        </figure>
      {/if}

      <div class="enter" style:--d="240ms">
        <ArticleBody html={data.html} bind:element={body} />
      </div>
    </article>

    <aside class="right" aria-label="Reactions and details">
      <div class="enter sticky" style:--d="280ms">
        <Reactions {reactions} variant="card" />
        <section class="card commit" aria-labelledby="commit-title">
          <h2 id="commit-title" class="label">COMMIT</h2>
          <p>{post.hash} · +{post.words.toLocaleString('en-US')} words</p>
          <p>edited <time datetime={post.editedAt}>{edited}</time></p>
          <a class="source" href={post.url} target="_blank" rel="noopener"
            >view source ↗</a
          >
        </section>
      </div>
    </aside>
  </div>
</div>

<div class="floating">
  <Reactions {reactions} variant="bar" title={post.title} />
</div>

<style>
  .page {
    padding-top: 12px;
    padding-bottom: 64px;
  }

  .layout {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr) 220px;
    gap: 44px;
    align-items: start;
  }

  .sticky {
    position: sticky;
    top: 96px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .main {
    display: flex;
    flex-direction: column;
    gap: 22px;
    min-width: 0;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .title {
    margin: 0;
    font-size: 48px;
    line-height: 1.05;
    letter-spacing: -0.04em;
    font-weight: 700;
    text-wrap: balance;
  }

  .byline {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-3);
  }

  .meta-m,
  .toc-pill {
    display: none;
  }

  .cover {
    margin: 0;
    overflow: hidden;
    border-radius: 18px;
    background: var(--chip);
    aspect-ratio: 1000 / 420;
  }

  .cover :global(.cover-img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .commit {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    border-radius: 16px;
    box-shadow: none;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-2);
  }

  .commit p {
    margin: 0;
  }

  .label {
    margin: 0;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.12em;
    color: var(--ink-4);
  }

  .source {
    color: var(--blue-ink);
  }

  .source:hover {
    text-decoration: underline;
  }

  .floating {
    display: none;
  }

  /* Below 1024 the sidebars fold away: the TOC becomes a pill above the
     article and the reactions float at the bottom of the screen. */
  @media (max-width: 1023px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
      max-width: 720px;
      margin-inline: auto;
    }

    .left,
    .right {
      display: none;
    }

    .toc-pill {
      display: block;
    }

    .floating {
      display: block;
    }

    .page {
      padding-bottom: 112px;
    }
  }

  /* Phones follow M4: cover first, then title, then a one-line meta. */
  @media (max-width: 767px) {
    .page {
      padding-top: 6px;
    }

    .main {
      gap: 14px;
    }

    .cover {
      order: -2;
      border-radius: 16px;
    }

    .title {
      order: -1;
      font-size: 30px;
      line-height: 1.08;
    }

    .tags,
    .byline {
      display: none;
    }

    .meta-m {
      display: block;
      order: -1;
      margin: 0;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--ink-3);
    }
  }
</style>
