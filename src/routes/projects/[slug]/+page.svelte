<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import PageGlow from '#components/chrome/PageGlow.svelte'
  import Changelog from '#components/projects/Changelog.svelte'
  import Gallery from '#components/projects/Gallery.svelte'
  import Screens from '#components/projects/Screens.svelte'
  import SegmentedTabs from '#components/projects/SegmentedTabs.svelte'
  import StrapiBlocks from '#components/StrapiBlocks.svelte'
  import WordReveal from '#components/ui/WordReveal.svelte'
  import { languageColor } from '#lib/projects.js'
  import { SITE_URL } from '#lib/site.js'
  import type {
    DeveloperRole,
    FeatureFlag,
    PlatformType,
  } from '#lib/types/types.js'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const project = $derived(data.project)
  const detail = $derived(data.detail)

  type Tab = 'overview' | 'screens' | 'stack' | 'changelog'

  const TAB_IDS: Tab[] = ['overview', 'screens', 'stack', 'changelog']

  const tabs = $derived([
    { id: 'overview' as const, label: 'overview' },
    {
      id: 'screens' as const,
      label: `screens ${project.screenshots.length + detail.videos.length}`,
    },
    { id: 'stack' as const, label: 'stack' },
    { id: 'changelog' as const, label: 'changelog' },
  ])

  let tab = $state<Tab>('overview')

  // `?tab=` only exists in the browser; prerendering cannot read it.
  onMount(() => {
    const wanted = new URL(location.href).searchParams.get('tab') as Tab | null

    if (wanted && TAB_IDS.includes(wanted)) tab = wanted
  })

  // A new project (client-side navigation between projects) starts on overview.
  $effect(() => {
    void project.slug

    if (!new URL(location.href).searchParams.get('tab')) tab = 'overview'
  })

  const choose = (next: Tab) => {
    tab = next

    const url = new URL(page.url.href)

    if (next === 'overview') url.searchParams.delete('tab')
    else url.searchParams.set('tab', next)

    goto(url, { shallow: true, replace: true, state: page.state })
  }

  const STATUS = {
    live: { label: 'live in production', tone: 'green' },
    'in progress': { label: 'in progress', tone: 'orange' },
    planned: { label: 'planned', tone: 'blue' },
  } as const

  const KIND_LABEL = {
    mobile: 'mobile app',
    web: 'web app',
    infra: 'infrastructure',
    game: 'game',
    cli: 'cli tool',
  } as const

  const PLATFORM: Record<PlatformType, string> = {
    android: 'Android',
    ios: 'iOS',
    'android-and-ios': 'Android & iOS',
    web: 'Web',
    cloud: 'Cloud',
  }

  const ROLE: Record<DeveloperRole, string> = {
    solo: 'Solo developer',
    'small-team': 'Small team',
    'cross-functional': 'Cross-functional team',
    'feature-ownership': 'Feature owner',
    freelance: 'Freelance',
    'open-source': 'Open source',
  }

  const FEATURE: Record<FeatureFlag, string> = {
    performant: 'Performant',
    'mobile-first': 'Mobile-first',
    'cross-platform': 'Cross-platform',
    'open-source': 'Open source',
    'production-ready': 'Production-ready',
    'well-documented': 'Well documented',
    secure: 'Secure',
    'modern-ui': 'Modern UI',
    'user-centered': 'User-centered',
    'modern-dev': 'Modern tooling',
  }

  const month = (iso: string | null) =>
    iso
      ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        })
      : null

  // Some CMS entries end before they start; those show only the start.
  const span = $derived.by(() => {
    const start = month(detail.startDate)
    const validEnd = detail.endDate && detail.endDate >= detail.startDate

    if (project.status !== 'live') return `${start} — now`

    return validEnd ? `${start} — ${month(detail.endDate)}` : start
  })

  const links = $derived(
    [
      detail.googlePlayLink && {
        label: 'Google Play',
        glyph: '▶',
        href: detail.googlePlayLink,
      },
      detail.appStoreLink && {
        label: 'App Store',
        glyph: '',
        href: detail.appStoreLink,
      },
      detail.githubLink && {
        label: 'source',
        glyph: '⌥',
        href: detail.githubLink,
      },
    ].filter(Boolean) as { label: string; glyph: string; href: string }[]
  )

  const status = $derived(STATUS[project.status])
  const ogImage = $derived(`${SITE_URL}/og/projects/${project.slug}.png`)
</script>

<svelte:head>
  <title>{project.title} | Pranta Dutta</title>
  <meta name="description" content={project.description} />
  <link rel="canonical" href="{SITE_URL}/projects/{project.slug}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{project.title} | Pranta Dutta" />
  <meta property="og:description" content={project.description} />
  <meta property="og:url" content="{SITE_URL}/projects/{project.slug}" />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>

<PageGlow
  glows={[
    { hue: 'green', width: 800, height: 500, left: 200, top: -260, drift: 1 },
  ]}
/>

<div class="container-page page">
  <header class="head">
    <div class="titles">
      <div class="badges enter" style:--d="60ms">
        <span
          class="pill"
          style:--pill="var(--{status.tone})"
          style:--pill-ink="var(--{status.tone}-ink)">● {status.label}</span
        >
        <span class="pill">{KIND_LABEL[project.kind]}</span>
      </div>
      <h1
        class="title"
        style:view-transition-name="project-title-{project.slug}"
      >
        <WordReveal text={project.title} delay={120} />
      </h1>
    </div>
    <div class="enter" style:--d="300ms">
      <SegmentedTabs {tabs} value={tab} idPrefix="project" onchange={choose} />
    </div>
  </header>

  <div class="layout">
    <div
      class="main enter"
      style:--d="360ms"
      id="project-panel"
      role="tabpanel"
      aria-labelledby="project-tab-{tab}"
    >
      {#if tab === 'overview'}
        <Gallery
          slug={project.slug}
          title={project.title}
          screenshots={project.screenshots}
        />

        {#if detail.longDescription?.length}
          <article class="card readme">
            <div class="card-header">
              <span aria-hidden="true">☰</span> <b>README.md</b>
            </div>
            <div class="prose">
              <StrapiBlocks content={detail.longDescription} />
            </div>
          </article>
        {/if}

        {#if data.changelog.length}
          <Changelog rows={data.changelog} />
        {/if}
      {:else if tab === 'screens'}
        <Screens
          title={project.title}
          screenshots={project.screenshots}
          videos={detail.videos}
        />
      {:else if tab === 'stack'}
        <section class="card stack-card" aria-label="Stack">
          <div class="card-header">stack · cat package.json</div>
          <dl class="facts">
            <div>
              <dt>languages</dt>
              <dd class="langs">
                {#each project.languages as language (language)}
                  <span class="lang"
                    ><i class="dot" style:--c={languageColor(language)}
                    ></i>{language}</span
                  >
                {:else}
                  <span class="muted">—</span>
                {/each}
              </dd>
            </div>
            <div>
              <dt>tags</dt>
              <dd class="chips">
                {#each detail.tags as tag (tag)}<span class="chip">{tag}</span
                  >{/each}
              </dd>
            </div>
            <div>
              <dt>platform</dt>
              <dd>{PLATFORM[detail.platformType]}</dd>
            </div>
            <div>
              <dt>role</dt>
              <dd>{ROLE[detail.developerRole]}</dd>
            </div>
            <div>
              <dt>timeline</dt>
              <dd>{span}</dd>
            </div>
            {#if detail.features.length}
              <div>
                <dt>qualities</dt>
                <dd class="chips">
                  {#each detail.features as feature (feature)}<span class="chip"
                      >{FEATURE[feature]}</span
                    >{/each}
                </dd>
              </div>
            {/if}
          </dl>
        </section>
      {:else}
        <Changelog rows={data.changelog} />
      {/if}
    </div>

    <aside class="side enter" style:--d="440ms">
      <section class="card box">
        <h2>About</h2>
        <p class="about">{project.description}</p>
        {#if links.length}
          <ul class="links">
            {#each links as link (link.href)}
              <li>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <span class="glyph" aria-hidden="true">{link.glyph}</span
                  >{link.label}
                  <span class="ne" aria-hidden="true">↗</span>
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      {#if project.impactStats.length}
        <section class="impact" aria-label="Impact">
          <span class="impact-glow" aria-hidden="true"></span>
          <h2>IMPACT</h2>
          <dl>
            {#each project.impactStats as stat (stat.id)}
              <div>
                <dt>{stat.label}</dt>
                <dd class:good={stat.highlight}>{stat.value}</dd>
              </div>
            {/each}
          </dl>
        </section>
      {/if}

      <section class="card box">
        <h2>Stack</h2>
        <div class="chips">
          {#each project.stack as tag (tag)}<span class="chip">{tag}</span
            >{/each}
        </div>
        <h2 class="complexity-title">Complexity</h2>
        <div
          class="meter"
          role="meter"
          aria-valuemin="1"
          aria-valuemax="5"
          aria-valuenow={detail.complexity}
          aria-label="Complexity {detail.complexity} out of 5"
        >
          {#each [1, 2, 3, 4, 5] as n (n)}
            <span class:on={n <= detail.complexity} style:--i={n}></span>
          {/each}
        </div>
      </section>
    </aside>
  </div>
</div>

<style>
  .page {
    padding-bottom: 48px;
  }

  .head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }

  .titles {
    min-width: 0;
  }

  .badges {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }

  .title {
    margin: 0;
    font-size: clamp(36px, 4.7vw, 60px);
    font-weight: 700;
    letter-spacing: -0.045em;
    line-height: 1;
    text-wrap: balance;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 24px;
    align-items: start;
    margin-top: 22px;
  }

  .main {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
  }

  .side {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 22px;
    box-shadow: none;
  }

  .box h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }

  .about {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink-2);
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 4px 0 0;
    padding: 0;
    list-style: none;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .links a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
    color: var(--blue-ink);
  }

  .glyph {
    width: 14px;
    color: var(--ink-3);
    text-align: center;
  }

  .ne {
    transition: transform var(--dur-2) var(--ease-out);
  }

  .links a:hover .ne {
    transform: translate(2px, -2px);
  }

  .impact {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 22px;
    border-radius: 18px;
    background: #15171c;
    color: #fff;
  }

  :global([data-theme='dark']) .impact {
    background: #1b1d22;
    border: 1px solid var(--border-strong);
  }

  .impact-glow {
    position: absolute;
    top: -80px;
    right: -80px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      oklch(0.62 0.15 150 / 0.6),
      transparent 65%
    );
  }

  .impact h2 {
    position: relative;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 400;
    color: #9a9a94;
  }

  .impact dl {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin: 0;
  }

  .impact div {
    display: flex;
    flex-direction: column-reverse;
  }

  .impact dd {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .impact dd.good {
    color: oklch(0.8 0.15 150);
  }

  .impact dt {
    font-size: 12px;
    color: #9a9a94;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chips .chip {
    padding: 5px 10px;
    border-radius: 8px;
  }

  .complexity-title {
    margin-top: 6px !important;
  }

  .meter {
    display: flex;
    gap: 4px;
  }

  .meter span {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background: var(--chip);
  }

  .meter span.on {
    background: var(--green);
    animation: meter-in 400ms var(--ease-out) calc(600ms + var(--i) * 60ms) both;
    transform-origin: left;
  }

  @keyframes meter-in {
    from {
      scale: 0 1;
    }
  }

  .readme {
    overflow: hidden;
    box-shadow: none;
  }

  .readme .card-header b {
    color: var(--ink);
    font-weight: 600;
  }

  .prose {
    padding: 24px 28px 28px;
    font-size: 16px;
    line-height: 1.7;
    color: var(--ink-body);
  }

  .prose :global(:is(h1, h2, h3, h4, h5, h6)) {
    margin: 1.4em 0 0.5em;
    color: var(--ink);
    font-size: 19px;
    letter-spacing: -0.015em;
    line-height: 1.3;
  }

  .prose :global(:is(h1, h2, h3, h4, h5, h6):first-child) {
    margin-top: 0;
  }

  .prose :global(p) {
    margin: 0 0 0.9em;
  }

  .prose :global(:is(ul, ol)) {
    margin: 0 0 1em;
    padding-left: 1.3em;
  }

  .prose :global(li) {
    margin: 0.3em 0;
  }

  .prose :global(li::marker) {
    color: var(--ink-4);
  }

  .prose :global(strong) {
    color: var(--ink);
  }

  .prose :global(a) {
    color: var(--blue-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .prose :global(code) {
    padding: 2px 6px;
    border-radius: 6px;
    background: var(--chip);
    font-family: var(--font-mono);
    font-size: 0.88em;
  }

  .prose :global(pre) {
    overflow-x: auto;
    padding: 14px 16px;
    border-radius: 14px;
    background: var(--code-bg);
    color: var(--code-ink);
  }

  .prose :global(pre code) {
    padding: 0;
    background: none;
  }

  .prose :global(blockquote) {
    margin: 0 0 1em;
    padding: 2px 0 2px 16px;
    border-left: 2px solid var(--green);
    color: var(--ink-2);
  }

  .prose :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
  }

  .stack-card {
    overflow: hidden;
    box-shadow: none;
  }

  .facts {
    display: flex;
    flex-direction: column;
    margin: 0;
  }

  .facts > div {
    display: grid;
    grid-template-columns: 110px minmax(0, 1fr);
    gap: 16px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--row-divider);
  }

  .facts > div:last-child {
    border-bottom: 0;
  }

  .facts dt {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-3);
    padding-top: 3px;
  }

  .facts dd {
    margin: 0;
    font-size: 15px;
  }

  .langs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
  }

  .lang {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .muted {
    color: var(--ink-4);
  }

  @media (max-width: 1023px) {
    .head {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }

    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 767px) {
    .prose {
      padding: 18px;
      font-size: 15px;
    }

    .facts > div {
      grid-template-columns: 1fr;
      gap: 6px;
      padding: 12px 16px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .meter span.on {
      animation: none;
    }
  }
</style>
