<script lang="ts">
  import Globe from '@lucide/svelte/icons/globe'
  import Mail from '@lucide/svelte/icons/mail'
  import MapPin from '@lucide/svelte/icons/map-pin'

  import LanguagesCard from '#components/about/LanguagesCard.svelte'
  import PageGlow from '#components/chrome/PageGlow.svelte'
  import Avatar from '#components/ui/Avatar.svelte'
  import RelativeTime from '#components/ui/RelativeTime.svelte'
  import { profile, readme } from '#lib/data/profile.js'
  import { SITE_URL } from '#lib/site.js'
  import { copyText } from '#lib/toast.svelte.js'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const TONE_INK = {
    green: 'var(--green-ink)',
    blue: 'var(--blue-ink)',
    purple: 'var(--purple-ink)',
  } as const

  const title = 'About | Pranta Dutta'
  const description = `${readme.subtitle}. ${readme.bio} Based in ${profile.location}.`
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="{SITE_URL}/about" />
  <meta property="og:type" content="profile" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="{SITE_URL}/about" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta property="og:image" content="{SITE_URL}/og/about.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:image" content="{SITE_URL}/og/about.png" />
</svelte:head>

<PageGlow
  glows={[{ hue: 'blue', width: 600, height: 500, left: -200, top: -200 }]}
/>

<div class="container-page page">
  <article
    class="card readme enter"
    style:--d="80ms"
    aria-labelledby="readme-title"
  >
    <div class="file-bar">
      <span aria-hidden="true">☰</span>
      <span class="file">README.md</span>
      <span class="edited"
        >last edited <RelativeTime date={readme.editedAt} /></span
      >
    </div>

    <div class="body">
      <div class="hello">
        <Avatar size={96} radius="24px" priority />
        <div>
          <h1 id="readme-title">{readme.title}</h1>
          <p class="subtitle">{readme.subtitle}</p>
        </div>
      </div>

      <!-- eslint-disable-next-line svelte/no-at-html-tags -- authored copy in profile.ts -->
      <p>{@html readme.introHtml}</p>

      <h2>{readme.winsTitle}</h2>
      <ul class="wins">
        {#each readme.wins as win, i (win.label)}
          <li class="enter" style:--d="{240 + i * 50}ms">
            <a href={win.href} class="win">
              <span class="value tabular" style:color={TONE_INK[win.tone]}
                >{win.value}</span
              >
              <span class="label">{win.label}</span>
            </a>
          </li>
        {/each}
      </ul>

      <h2>{readme.nowTitle}</h2>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- authored copy in profile.ts -->
      <p>{@html readme.nowHtml}</p>
    </div>
  </article>

  <aside class="sidebar">
    <section
      class="side-card enter"
      style:--d="160ms"
      aria-labelledby="about-title"
    >
      <h2 id="about-title" class="title">About</h2>
      <p class="bio">{readme.bio}</p>
      <ul class="meta">
        <li>
          <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
          {profile.location}
        </li>
        <li>
          <button
            type="button"
            class="copy"
            onclick={() => copyText(profile.email, 'email copied')}
            title="Copy email"
          >
            <Mail size={14} strokeWidth={1.75} aria-hidden="true" />
            {profile.email}
          </button>
        </li>
        <li>
          <a href="/"
            ><Globe size={14} strokeWidth={1.75} aria-hidden="true" />
            {profile.site}</a
          >
        </li>
      </ul>
    </section>

    <section
      class="side-card enter"
      style:--d="210ms"
      aria-labelledby="releases-title"
    >
      <h2 id="releases-title" class="title">
        Releases <span class="count">{data.releases.length}</span>
      </h2>
      <ul class="releases">
        {#each data.releases as release (release.label)}
          <li>
            <span class="version tabular">{release.value}</span>
            <span>{release.label}</span>
          </li>
        {/each}
      </ul>
    </section>

    <div class="enter" style:--d="260ms">
      <LanguagesCard
        languages={data.languages}
        windowMonths={data.languageWindowMonths}
      />
    </div>
  </aside>
</div>

<style>
  .page {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 28px;
    align-items: start;
    padding-bottom: 48px;
  }

  .readme {
    overflow: hidden;
  }

  .file-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--divider);
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-2);
  }

  .file {
    font-weight: 600;
    color: var(--ink);
  }

  .edited {
    margin-left: auto;
    color: var(--ink-4);
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 34px 40px;
    font-size: 17px;
    line-height: 1.7;
    color: var(--ink-body);
  }

  .body p {
    margin: 0;
  }

  .body :global(b) {
    font-weight: 600;
    color: var(--ink);
  }

  .body :global(code) {
    padding: 2px 7px;
    border-radius: 6px;
    background: var(--chip);
    font-family: var(--font-mono);
    font-size: 15px;
    color: var(--ink-body);
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }

  .hello {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  h1 {
    margin: 0;
    font-size: 42px;
    line-height: 1.05;
    letter-spacing: -0.04em;
    font-weight: 700;
    color: var(--ink);
  }

  .body .subtitle {
    margin: 6px 0 0;
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.4;
    color: var(--ink-3);
  }

  .body h2 {
    margin: 8px 0 0;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--divider);
    font-size: 22px;
    line-height: 1.3;
    letter-spacing: -0.02em;
    font-weight: 700;
    color: var(--ink);
  }

  .wins {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .win {
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100%;
    padding: 16px;
    border-radius: 14px;
    border: 1px solid var(--tile-border);
    background: var(--surface-muted);
    transition:
      transform var(--dur-3) var(--ease-out),
      border-color var(--dur-3) var(--ease-out);
  }

  @media (hover: hover) {
    .win:hover {
      transform: translateY(-2px);
      border-color: color-mix(in oklch, var(--ink) 20%, var(--tile-border));
    }
  }

  .value {
    font-size: 30px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .label {
    font-size: 14px;
    line-height: 1.4;
    color: var(--ink-2);
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .side-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }

  .count {
    padding: 1px 7px;
    border-radius: 999px;
    background: var(--chip);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 400;
    color: var(--ink-3);
  }

  .bio {
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-2);
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-2);
  }

  .meta li,
  .meta a,
  .copy {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .meta a,
  .copy {
    color: inherit;
    text-align: left;
    overflow-wrap: anywhere;
  }

  .meta :global(svg) {
    flex: none;
    color: var(--ink-3);
  }

  .meta a:hover,
  .copy:hover {
    color: var(--ink);
  }

  .releases {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 14px;
    line-height: 1.4;
  }

  /* A fixed badge column, so every label starts at the same x however wide
     its number is; each badge sits on its label's first line. */
  .releases li {
    display: grid;
    grid-template-columns: 50px minmax(0, 1fr);
    align-items: baseline;
    column-gap: 12px;
  }

  .version {
    padding: 2px 4px;
    text-align: center;
    border-radius: 999px;
    border: 1px solid var(--green);
    color: var(--green-ink);
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1.3;
  }

  @media (max-width: 1023px) {
    .page {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }
  }

  @media (max-width: 767px) {
    .body {
      gap: 16px;
      padding: 24px 20px;
      font-size: 16px;
    }

    .hello {
      flex-direction: column;
      align-items: flex-start;
      gap: 14px;
    }

    .hello :global(.avatar) {
      width: 72px !important;
      height: 72px !important;
      border-radius: 18px !important;
    }

    h1 {
      font-size: 30px;
    }

    .wins {
      grid-template-columns: minmax(0, 1fr);
    }

    .value {
      font-size: 26px;
    }
  }
</style>
