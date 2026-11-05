<script lang="ts">
  import PostCard from '#components/blog/PostCard.svelte'
  import PageGlow from '#components/chrome/PageGlow.svelte'
  import CommitGraph from '#components/git/CommitGraph.svelte'
  import Heatmap from '#components/git/Heatmap.svelte'
  import FeaturedProject from '#components/projects/FeaturedProject.svelte'
  import HeroPhones from '#components/projects/HeroPhones.svelte'
  import CvButton from '#components/ui/CvButton.svelte'
  import WordReveal from '#components/ui/WordReveal.svelte'
  import { heroStats, home, profile } from '#lib/data/profile.js'
  import { ambient } from '#lib/motion/ambient.js'
  import { reveal } from '#lib/motion/reveal.js'
  import { SITE_URL } from '#lib/site.js'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const accent = $derived(
    home.headlineAccent.replace('{n}', String(data.projectCount))
  )
  const status = profile.status
  const place = ` · ${profile.city}, ${profile.timezone}`

  const title = 'Pranta Dutta | Flutter & Mobile Engineer'
  const description = `Pranta Dutta is a Flutter & Mobile Engineer with ${profile.years} years of experience building production apps, backend APIs and AI-powered systems, with code merged into the Flutter SDK.`
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="{SITE_URL}/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="{SITE_URL}/" />
  <meta property="og:image" content="{SITE_URL}/og/home.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="{SITE_URL}/og/home.png" />
</svelte:head>

<PageGlow
  glows={[
    { hue: 'green', width: 700, height: 500, right: -100, top: -200, drift: 2 },
    {
      hue: 'purple',
      width: 600,
      height: 500,
      left: -200,
      top: 610,
      drift: 1,
      duration: 16,
      darkOnly: true,
    },
  ]}
/>

<div class="container-page page">
  <section class="hero" aria-labelledby="hero-title">
    <div class="intro">
      {#if profile.openToWork}
        <p class="status">
          <span
            class="live-dot"
            style:animation-delay="{80 + (status.length + place.length) * 18}ms"
          ></span>
          <span class="typed"
            ><span
              class="type-on"
              style:--chars={status.length}
              style:--d="80ms">{status}</span
            ><span
              class="type-on place"
              style:--chars={place.length}
              style:--d="{80 + status.length * 18}ms">{place}</span
            ></span
          >
        </p>
      {/if}

      <h1 id="hero-title" class="headline">
        <span class="line"><WordReveal text={home.headline} delay={160} /></span
        >
        <span class="line grad-text"
          ><WordReveal text={accent} delay={360} /></span
        >
      </h1>

      <p class="lead enter" style:--d="500ms">
        <span class="long">{home.lead}</span>
        <span class="short">{home.leadShort}</span>
      </p>

      <div class="actions">
        <a class="btn btn-primary enter" style:--d="540ms" href="/contact">
          $ contact --now <span class="arrow">→</span>
        </a>
        <span class="enter" style:--d="580ms"><CvButton label="cv.pdf" /></span>
        <a
          class="btn btn-outline enter"
          style:--d="620ms"
          href={profile.servicesUrl}
          target="_blank"
          rel="noopener"
        >
          services <span class="arrow arrow-ne">↗</span>
        </a>
      </div>
    </div>

    <div class="side">
      <HeroPhones phones={data.heroPhones} />
      <div class="heat">
        <Heatmap activity={data.activity} stats={heroStats} />
      </div>
    </div>
  </section>

  <div class="graph">
    <CommitGraph commits={data.commits} />
  </div>

  {#if data.featuredProjects.length}
    <section class="more" aria-labelledby="work-title">
      <header class="more-head" use:reveal>
        <h2 id="work-title" class="more-title">
          <span aria-hidden="true">$</span> ls projects --featured
        </h2>
        <a class="more-link" href="/projects">
          all {data.projectCount} projects <span class="arrow">→</span>
        </a>
      </header>
      <ul class="work" use:reveal={{ stagger: true }}>
        {#each data.featuredProjects as project (project.slug)}
          <li><FeaturedProject {project} /></li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if data.latestPosts.length}
    <section class="more" aria-labelledby="writing-title">
      <header class="more-head" use:reveal>
        <h2 id="writing-title" class="more-title">
          <span aria-hidden="true">$</span> ls posts --latest
        </h2>
        <a class="more-link" href="/blogs">
          all {data.postCount} posts <span class="arrow">→</span>
        </a>
      </header>
      <ul class="writing" use:reveal={{ stagger: true }}>
        {#each data.latestPosts as post (post.slug)}
          <li><PostCard {post} /></li>
        {/each}
      </ul>
    </section>
  {/if}

  <section class="closing" aria-labelledby="closing-title" use:reveal>
    <div class="closing-glow ambient" use:ambient aria-hidden="true"></div>
    <div class="closing-text">
      <p class="closing-command">{home.closing.command}</p>
      <h2 id="closing-title">{home.closing.title}</h2>
      <p class="closing-note">
        {#if profile.openToWork}
          <span>{profile.availability}</span>
          <span class="closing-dot" aria-hidden="true">·</span>
        {/if}
        <span>{profile.responseTime}</span>
      </p>
    </div>
    <!-- Phones already have these in the pinned row just below. -->
    <div class="closing-actions">
      <a class="btn btn-primary" href="/contact">
        $ contact --now <span class="arrow">→</span>
      </a>
      <CvButton label="cv.pdf" />
    </div>
  </section>

  <!-- Phones get the two calls to action pinned to the bottom (M1). -->
  <div class="sticky-cta">
    <a class="btn btn-primary" href="/contact"
      >$ contact --now <span class="arrow">→</span></a
    >
    <CvButton label="cv" />
  </div>
</div>

<style>
  .page {
    padding-bottom: 48px;
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 520px;
    gap: 48px;
    align-items: end;
  }

  /* The phones stand behind the heatmap card, so the card sits on top. */
  .side {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-self: stretch;
    min-width: 0;
  }

  .heat {
    position: relative;
    z-index: 1;
  }

  .intro {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-width: 0;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--status-ink);
  }

  .status .type-on {
    display: inline-block;
    white-space: pre;
  }

  .headline {
    margin: 0;
    font-size: clamp(40px, 5.2vw, 66px);
    line-height: 1;
    letter-spacing: -0.045em;
    font-weight: 700;
  }

  .headline .line {
    display: block;
  }

  .lead {
    margin: 0;
    max-width: 560px;
    font-size: clamp(15.5px, 1.4vw, 18px);
    line-height: 1.6;
    color: var(--ink-2);
    text-wrap: pretty;
  }

  .lead .short {
    display: none;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .graph {
    margin-top: 28px;
  }

  .more {
    margin-top: 44px;
  }

  .more-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  .more-title {
    min-width: 0;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 400;
    color: var(--ink-3);
  }

  /* The padding is for fingers; the margin keeps it out of the layout. */
  .more-link {
    flex: none;
    margin-block: -8px;
    padding-block: 8px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--blue-ink);
  }

  .more-link .arrow {
    display: inline-block;
    transition: transform var(--dur-2) var(--ease-out);
  }

  @media (hover: hover) {
    .more-link:hover {
      text-decoration: underline;
    }

    .more-link:hover .arrow {
      transform: translateX(3px);
    }
  }

  .work,
  .writing {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .writing li {
    display: flex;
    flex-direction: column;
  }

  .writing li > :global(.post) {
    flex: 1;
  }

  /* Follows the theme, like the open-source banner: a card with a soft glow. */
  .closing {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 24px;
    margin-top: 44px;
    padding: 28px 30px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--surface);
  }

  .closing-glow {
    position: absolute;
    top: -110px;
    right: -100px;
    width: 500px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(ellipse, var(--glow-green), transparent 65%);
    animation: drift2 12s ease-in-out infinite;
    pointer-events: none;
  }

  .closing-text,
  .closing-actions {
    position: relative;
  }

  .closing-text {
    min-width: 0;
  }

  .closing-command {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-3);
  }

  .closing h2 {
    margin: 6px 0 0;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .closing-note {
    margin: 8px 0 0;
    font-size: 14.5px;
    line-height: 1.5;
    color: var(--ink-2);
  }

  .closing-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .sticky-cta {
    display: none;
  }

  /* Three post cards side by side leave a title too little room this narrow. */
  @media (max-width: 1199px) {
    .writing {
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
    }
  }

  @media (max-width: 1023px) {
    .hero {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
    }

    .closing {
      grid-template-columns: minmax(0, 1fr);
      gap: 18px;
    }
  }

  @media (max-width: 767px) {
    .intro {
      gap: 16px;
    }

    .status {
      gap: 8px;
      font-size: 12px;
    }

    .status .place {
      display: none;
    }

    .headline {
      line-height: 1.02;
    }

    .headline .line {
      display: inline;
    }

    .lead {
      line-height: 1.55;
    }

    .lead .long {
      display: none;
    }

    .lead .short {
      display: inline;
    }

    .actions {
      display: none;
    }

    .hero {
      gap: 16px;
    }

    .graph {
      margin-top: 16px;
    }

    .more,
    .closing {
      margin-top: 32px;
    }

    .more-head {
      margin-bottom: 12px;
    }

    /* Phones: the projects become one swipeable row, edge to edge, the way
       the repositories do on /open-source. */
    .work {
      grid-template-columns: none;
      grid-auto-flow: column;
      grid-auto-columns: min(80%, 320px);
      gap: 10px;
      margin-inline: calc(var(--gutter) * -1);
      padding: 4px var(--gutter);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-padding-inline: var(--gutter);
      scrollbar-width: none;
    }

    .work li {
      scroll-snap-align: start;
    }

    .closing {
      padding: 22px 20px;
    }

    .closing-glow {
      top: -120px;
      right: -130px;
      width: 340px;
      height: 240px;
    }

    .closing h2 {
      font-size: 22px;
    }

    /* One fact per line, so the dot can't strand at the end of a line. */
    .closing-note span {
      display: block;
    }

    .closing-note .closing-dot {
      display: none;
    }

    .closing-actions {
      display: none;
    }

    .sticky-cta {
      position: sticky;
      z-index: 20;
      bottom: max(14px, env(safe-area-inset-bottom));
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      margin-top: 16px;
    }

    .sticky-cta > :global(*) {
      padding: 15px 16px;
      border-radius: 12px;
    }
  }
</style>
