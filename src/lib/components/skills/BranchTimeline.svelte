<script lang="ts" module>
  export type Branch = 'main' | 'contract' | 'oss' | 'indie'

  export interface TimelineEntry {
    branch: Branch
    /** "YYYY-MM", or "YYYY" when only the year is known */
    start: string
    end: string | null
    role: string
    company: string | null
    summary: string
    highlights: string[]
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { cubicOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'

  import { isBelowFold, prefersReducedMotion } from '$lib/motion'
  import { inview } from '$lib/motion/inview'

  let { entries }: { entries: TimelineEntry[] } = $props()

  const month = (value: string) =>
    value.length === 4
      ? value
      : new Date(`${value}-01T00:00:00Z`).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        })

  const range = (entry: TimelineEntry) =>
    `${month(entry.start)} — ${entry.end ? month(entry.end) : 'now'}`

  /**
   * The side lane above a main-line row carries the next side branch down,
   * if that branch is still running: it reaches all the way up to "now".
   * A side row itself draws from the top to its dot, then curves back into
   * main, which is where the branch forked.
   */
  const sideAbove = (i: number) => {
    const next = entries.slice(i + 1).find((entry) => entry.branch !== 'main')
    return next && !next.end ? next.branch : null
  }

  let open = $state<number | null>(null)

  let card: HTMLElement
  let phase = $state<'idle' | 'armed' | 'play'>('idle')
  onMount(() => {
    if (isBelowFold(card)) phase = 'armed'
  })
</script>

<section
  bind:this={card}
  class="timeline"
  data-phase={phase}
  aria-labelledby="experience-title"
  use:inview={{ enter: () => phase === 'armed' && (phase = 'play') }}
>
  <h2 id="experience-title">Experience</h2>

  <ol>
    {#each entries as entry, i (entry.role + entry.start)}
      {@const onMain = entry.branch === 'main'}
      {@const side = onMain ? sideAbove(i) : entry.branch}
      <li class="entry {entry.branch}" style:--i={i}>
        <div class="lanes" aria-hidden="true">
          <span class="line main-line"></span>
          {#if side}
            <span
              class="line side-line {side}"
              class:to-dot={!onMain}
              class:ended={!onMain && entry.end}
            ></span>
          {/if}
          {#if !onMain}
            <svg
              class="fork {entry.branch}"
              viewBox="0 0 44 100"
              preserveAspectRatio="none"
            >
              <path
                d="M27 0 C27 55 11 45 11 100"
                vector-effect="non-scaling-stroke"
              />
            </svg>
          {/if}
          <span class="node" class:side={!onMain}></span>
        </div>

        <div class="content">
          <p class="when">{entry.branch} · {range(entry)}</p>
          <h3>{entry.role}{entry.company ? ` · ${entry.company}` : ''}</h3>
          <p class="summary">{entry.summary}</p>

          {#if entry.highlights.length}
            <button
              type="button"
              class="toggle"
              aria-expanded={open === i}
              aria-controls="highlights-{i}"
              onclick={() => (open = open === i ? null : i)}
            >
              {open === i
                ? '− hide highlights'
                : `+ ${entry.highlights.length} highlights`}
            </button>
            {#if open === i}
              <ul
                id="highlights-{i}"
                class="highlights"
                transition:slide={{
                  duration: prefersReducedMotion.current ? 0 : 320,
                  easing: cubicOut,
                }}
              >
                {#each entry.highlights as highlight (highlight)}
                  <li>{highlight}</li>
                {/each}
              </ul>
            {/if}
          {/if}
        </div>
      </li>
    {/each}
  </ol>
</section>

<style>
  .timeline {
    padding: 24px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  h2 {
    margin: 0 0 16px;
    font-size: 17px;
    font-weight: 600;
  }

  ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Lane colours: the line/dot colour and an AA-safe text colour for each. */
  .main {
    --lane: var(--blue);
    --lane-ink: var(--blue-ink);
  }

  .oss {
    --lane: var(--purple);
    --lane-ink: var(--purple-ink);
  }

  .indie {
    --lane: var(--orange);
    --lane-ink: var(--orange-ink);
  }

  .contract {
    --lane: var(--cyan);
    --lane-ink: oklch(0.5 0.15 200);
  }

  :global([data-theme='dark']) .contract {
    --lane-ink: oklch(0.78 0.13 200);
  }

  .entry {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 14px;
  }

  .lanes {
    position: relative;
  }

  .line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    transform-origin: top;
  }

  .main-line {
    left: 10px;
    background: var(--blue);
  }

  .side-line {
    left: 26px;
    background: var(--lane);
  }

  /* A side row's own line stops at its dot; the curve below takes over. */
  .side-line.to-dot {
    bottom: auto;
    height: 12px;
  }

  /* A finished branch has no line above its last commit. */
  .side-line.ended {
    display: none;
  }

  .fork {
    position: absolute;
    left: 0;
    top: 12px;
    width: 44px;
    height: calc(100% - 12px);
    overflow: visible;
  }

  .fork path {
    fill: none;
    stroke: var(--lane);
    stroke-width: 2;
  }

  .node {
    position: absolute;
    top: 4px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--surface);
    border: 3px solid var(--lane);
  }

  .node.side {
    left: 19px;
  }

  .content {
    min-width: 0;
    padding-bottom: 24px;
  }

  .when {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--lane-ink);
  }

  h3 {
    margin: 4px 0 0;
    font-size: 19px;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .summary {
    margin: 4px 0 0;
    font-size: 14.5px;
    line-height: 1.5;
    color: var(--ink-2);
  }

  .toggle {
    margin-top: 8px;
    padding: 2px 0;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--lane-ink);
  }

  .toggle:hover {
    text-decoration: underline;
  }

  .highlights {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 10px 0 0;
    padding: 0 0 0 16px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-2);
  }

  .highlights li::marker {
    color: var(--ink-4);
  }

  /* --- Entrance: lines draw downward, dots pop as the line reaches them and
     forks draw their curve (MOTION §4 "Skills & Experience"). ---------------- */

  :global(html[data-js]:not([data-ready])) .timeline .line,
  .timeline[data-phase='armed'] .line {
    scale: 1 0;
  }

  :global(html[data-js]:not([data-ready])) .timeline .node,
  .timeline[data-phase='armed'] .node {
    scale: 0;
  }

  /* The curve is revealed top to bottom with a clip rather than a dash
     offset: dash lengths are unreliable on a non-scaling stroke. */
  :global(html[data-js]:not([data-ready])) .timeline .fork,
  .timeline[data-phase='armed'] .fork {
    clip-path: inset(0 0 100% 0);
  }

  :global(html[data-js]:not([data-ready])) .timeline .content,
  .timeline[data-phase='armed'] .content {
    opacity: 0;
  }

  .timeline {
    --base: 500ms;
  }

  .timeline[data-phase='play'] {
    --base: 0ms;
  }

  :global(html[data-ready]) .timeline:not([data-phase='armed']) .line {
    animation: draw-down 140ms linear calc(var(--base) + var(--i) * 140ms) both;
  }

  :global(html[data-ready]) .timeline:not([data-phase='armed']) .node {
    animation: pop 300ms var(--ease-spring)
      calc(var(--base) + var(--i) * 140ms + 60ms) both;
  }

  :global(html[data-ready]) .timeline:not([data-phase='armed']) .fork {
    animation: fork-draw 320ms var(--ease-out)
      calc(var(--base) + var(--i) * 140ms + 120ms) both;
  }

  :global(html[data-ready]) .timeline:not([data-phase='armed']) .content {
    animation: rise 500ms var(--ease-out) calc(var(--base) + var(--i) * 80ms)
      both;
  }

  @keyframes fork-draw {
    from {
      clip-path: inset(0 0 100% 0);
    }
    to {
      clip-path: inset(0 0 0 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .timeline .line,
    .timeline .node,
    .timeline .fork,
    .timeline .content {
      animation: none !important;
      scale: none !important;
      opacity: 1 !important;
      clip-path: none !important;
    }
  }

  @media (max-width: 767px) {
    .timeline {
      padding: 20px 16px;
    }

    h3 {
      font-size: 17px;
    }
  }
</style>
