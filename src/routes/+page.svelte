<script lang="ts">
  import PageGlow from '#components/chrome/PageGlow.svelte'
  import CommitGraph from '#components/git/CommitGraph.svelte'
  import Heatmap from '#components/git/Heatmap.svelte'
  import CvButton from '#components/ui/CvButton.svelte'
  import WordReveal from '#components/ui/WordReveal.svelte'
  import { heroStats, home, profile } from '#lib/data/profile.js'
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

    <Heatmap activity={data.activity} stats={heroStats} />
  </section>

  <div class="graph">
    <CommitGraph commits={data.commits} />
  </div>

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

  .sticky-cta {
    display: none;
  }

  @media (max-width: 1023px) {
    .hero {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
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
