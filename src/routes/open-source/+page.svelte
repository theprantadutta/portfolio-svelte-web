<script lang="ts">
  import PageGlow from '#components/chrome/PageGlow.svelte'
  import PrCard from '#components/oss/PrCard.svelte'
  import PrDialog from '#components/oss/PrDialog.svelte'
  import RepoCard from '#components/oss/RepoCard.svelte'
  import CountUp from '#components/ui/CountUp.svelte'
  import PageHeader from '#components/ui/PageHeader.svelte'
  import { ambient } from '#lib/motion/ambient.js'
  import { SITE_URL } from '#lib/site.js'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  /** The one detail dialog every pull request card opens. */
  let prDialog = $state<PrDialog>()

  /** The post that tells the story behind the Flutter SDK contributions. */
  const STORY =
    '/blogs/everyone-complains-about-flutter-almost-nobody-fixes-it-3342'

  const count = $derived(data.pullRequests.length)
  const title = 'Open source | Pranta Dutta'
  const description = $derived(
    `${count} merged pull requests to the Flutter framework, DevTools, Flutter packages, Supabase, Sentry and the React Native docs, reviewed and shipped by their maintainers.`
  )
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="{SITE_URL}/open-source" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="{SITE_URL}/open-source" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta property="og:image" content="{SITE_URL}/og/open-source.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:image" content="{SITE_URL}/og/open-source.png" />
</svelte:head>

<PageGlow
  glows={[{ hue: 'purple', width: 700, height: 500, left: -200, top: -200 }]}
/>

<div class="container-page page">
  <PageHeader
    command="$ gh pr list --author=@me --state=merged"
    title="{count} merged pull requests."
  >
    {#snippet aside()}
      <dl class="totals">
        <div>
          <dt>lines added</dt>
          <dd class="added">
            <CountUp value={data.totals.additions} prefix="+" delay={500} />
          </dd>
        </div>
        <div>
          <dt>lines removed</dt>
          <dd class="removed">
            <CountUp value={data.totals.deletions} prefix="−" delay={500} />
          </dd>
        </div>
        <div>
          <dt>repos</dt>
          <dd><CountUp value={data.totals.repos} delay={500} /></dd>
        </div>
      </dl>
    {/snippet}
  </PageHeader>

  <section
    class="banner enter"
    style:--d="300ms"
    aria-labelledby="featured-title"
  >
    <div class="banner-glow ambient" use:ambient aria-hidden="true"></div>
    <div class="banner-text">
      <p class="banner-eyebrow">FEATURED CONTRIBUTION · flutter/flutter</p>
      <h2 id="featured-title">
        Code shipped inside the Flutter SDK, used by every Flutter app.
      </h2>
    </div>
    <a class="btn btn-primary story" href={STORY}
      >read the story <span class="arrow">→</span></a
    >
  </section>

  <section class="section" aria-labelledby="repos-title">
    <h2 id="repos-title" class="section-title enter" style:--d="340ms">
      <span aria-hidden="true">$ </span>gh repo list --contributed
      <span class="section-count">{data.repositories.length}</span>
    </h2>
    <ul class="repos">
      {#each data.repositories as repo, i (repo.repo)}
        <li class="enter" style:--d="{360 + i * 40}ms">
          <RepoCard {repo} />
        </li>
      {/each}
    </ul>
  </section>

  <section class="section" aria-labelledby="prs-title">
    <h2 id="prs-title" class="section-title enter" style:--d="400ms">
      <span aria-hidden="true">$ </span>gh pr list --state merged
      <span class="section-count">{count}</span>
    </h2>
    <ul class="grid">
      {#each data.pullRequests as pr, i (pr.url)}
        <li class="enter" style:--d="{420 + Math.min(i, 8) * 50}ms">
          <PrCard {pr} index={i} onselect={(next) => prDialog?.show(next)} />
        </li>
      {/each}
    </ul>
  </section>
</div>

<PrDialog bind:this={prDialog} />

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 26px;
    padding-bottom: 48px;
  }

  .totals {
    display: flex;
    gap: 28px;
    margin: 0;
    font-family: var(--font-mono);
  }

  .totals div {
    display: flex;
    flex-direction: column-reverse;
  }

  .totals dd {
    margin: 0;
    font-size: 30px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--ink);
  }

  .totals .added {
    color: var(--green-ink);
  }

  .totals .removed {
    color: var(--red-ink);
  }

  .totals dt {
    font-size: 12px;
    color: var(--ink-3);
  }

  /* The featured banner follows the theme: a raised card with a purple glow. */
  .banner {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 24px;
    padding: 26px 30px;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--ink);
  }

  .banner-glow {
    position: absolute;
    width: 500px;
    height: 300px;
    right: -100px;
    top: -100px;
    border-radius: 50%;
    background: radial-gradient(ellipse, var(--glow-purple), transparent 65%);
    animation: drift2 12s ease-in-out infinite;
    pointer-events: none;
  }

  /* The theme's dark glow is tuned for whole pages; a card this size needs
     the stronger one it had before. */
  :global([data-theme='dark']) .banner-glow {
    background: radial-gradient(
      ellipse,
      oklch(0.62 0.15 300 / 0.6),
      transparent 65%
    );
  }

  .banner-text {
    position: relative;
  }

  .banner-eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-2);
  }

  .banner h2 {
    margin: 6px 0 0;
    font-size: 28px;
    line-height: 1.2;
    letter-spacing: -0.02em;
    font-weight: 700;
    text-wrap: balance;
  }

  .story {
    position: relative;
    padding: 12px 18px;
  }

  @media (hover: hover) {
    .story:hover {
      transform: translateY(-1px);
    }

    .story:hover .arrow {
      transform: translateX(3px);
    }
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .section-title {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 400;
    color: var(--ink-3);
  }

  .section-count {
    padding: 1px 8px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    font-size: 11px;
    color: var(--ink-2);
  }

  .repos {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .repos li {
    display: flex;
    flex-direction: column;
  }

  .repos li > :global(.repo) {
    flex: 1;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .grid li {
    display: flex;
    flex-direction: column;
  }

  .grid li > :global(.pr) {
    flex: 1;
  }

  @media (max-width: 1023px) {
    .grid,
    .repos {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 767px) {
    .page {
      gap: 18px;
    }

    /* Phones: the repositories become one swipeable row, edge to edge. */
    .repos {
      grid-template-columns: none;
      grid-auto-flow: column;
      grid-auto-columns: minmax(250px, 80%);
      gap: 10px;
      margin-inline: calc(var(--gutter) * -1);
      padding: 4px var(--gutter);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-padding-inline: var(--gutter);
      scrollbar-width: none;
    }

    .repos li {
      scroll-snap-align: start;
    }

    .totals {
      gap: 20px;
    }

    .totals dd {
      font-size: 24px;
    }

    .banner {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
      padding: 22px 20px;
    }

    .banner h2 {
      font-size: 22px;
    }

    .story {
      justify-self: start;
    }

    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
