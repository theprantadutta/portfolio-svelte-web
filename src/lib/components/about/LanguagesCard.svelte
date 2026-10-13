<script lang="ts">
  import { onMount } from 'svelte'

  import { isBelowFold } from '#lib/motion/index.js'
  import { inview } from '#lib/motion/inview.js'

  interface Language {
    name: string
    repos: number
    color: string
    percent: number
  }

  interface Props {
    languages: Language[]
    windowMonths: number
  }

  let { languages, windowMonths }: Props = $props()

  // The segments grow in from the left with the page (CSS, gated on
  // data-ready), or on first view when the card starts below the fold.
  let card: HTMLElement
  let phase = $state<'idle' | 'armed' | 'play'>('idle')
  onMount(() => {
    if (isBelowFold(card)) phase = 'armed'
  })
</script>

<section
  bind:this={card}
  class="side-card"
  data-phase={phase}
  aria-labelledby="languages-title"
  use:inview={{ enter: () => phase === 'armed' && (phase = 'play') }}
>
  <h2 id="languages-title" class="title">Languages</h2>

  <div
    class="bar"
    role="img"
    aria-label={languages.map((l) => `${l.name} ${l.percent}%`).join(', ')}
  >
    {#each languages as language, i (language.name)}
      <span
        class="segment"
        style:width="{language.percent}%"
        style:background={language.color}
        style:--i={i}
      ></span>
    {/each}
  </div>

  <ul class="legend">
    {#each languages as language (language.name)}
      <li>
        <span class="dot" style:--c={language.color}></span>
        <b>{language.name}</b>
        <span class="pct">{language.percent}%</span>
      </li>
    {/each}
  </ul>

  <p class="caption">public repos by language · last {windowMonths} months</p>
</section>

<style>
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
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }

  .bar {
    display: flex;
    gap: 2px;
    height: 8px;
    border-radius: 8px;
    overflow: hidden;
  }

  .segment {
    flex: none;
    height: 100%;
    transform-origin: left;
  }

  :global(html[data-js]:not([data-ready])) .segment,
  [data-phase='armed'] .segment {
    scale: 0 1;
  }

  :global(html[data-ready]) [data-phase='idle'] .segment {
    animation: grow 600ms var(--ease-out) calc(400ms + var(--i) * 60ms) both;
  }

  [data-phase='play'] .segment {
    animation: grow 600ms var(--ease-out) calc(var(--i) * 60ms) both;
  }

  @keyframes grow {
    from {
      scale: 0 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .segment {
      animation: none !important;
      scale: none !important;
    }
  }

  .legend {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 12px;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
  }

  .legend li {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .legend .dot {
    width: 8px;
    height: 8px;
  }

  .legend b {
    font-weight: 600;
  }

  .pct {
    color: var(--ink-4);
  }

  .caption {
    margin: 2px 0 0;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-4);
  }
</style>
