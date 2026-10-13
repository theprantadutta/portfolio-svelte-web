<script lang="ts" module>
  import type { Commit, Lane } from '$lib/data/commits'

  export interface GraphCommit extends Commit {
    hash: string
  }

  export const LANE_COLOR: Record<Lane, string> = {
    main: 'var(--blue)',
    oss: 'var(--purple)',
    writing: 'var(--orange)',
  }

  export const LANE_INK: Record<Lane, string> = {
    main: 'var(--blue-ink)',
    oss: 'var(--purple-ink)',
    writing: 'var(--orange-ink)',
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { cubicOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'

  import { LANES } from '$lib/data/commits'
  import { isBelowFold, prefersReducedMotion } from '$lib/motion'
  import { inview } from '$lib/motion/inview'

  interface Props {
    commits: GraphCommit[]
    /** When the lanes start drawing on page load, if already on screen. */
    delay?: number
  }

  let { commits, delay = 700 }: Props = $props()

  /**
   * Side branches (open source, writing) run from the top of the log down to
   * the last row any of them committed on, then end there, which reads as
   * merging back into main.
   */
  const sideEnd = $derived(
    commits.reduce((last, commit, i) => (commit.lane === 'main' ? last : i), -1)
  )

  const LEGEND: { lane: Lane; label: string }[] = [
    { lane: 'main', label: 'main · work' },
    { lane: 'oss', label: 'open-source' },
    { lane: 'writing', label: 'writing' },
  ]

  let open = $state<number | null>(null)
  const toggle = (i: number) => (open = open === i ? null : i)

  // Plays with the page-load choreography when on screen (CSS, gated on
  // data-ready); re-armed to play on scroll when it starts below the fold.
  let card: HTMLElement
  let phase = $state<'idle' | 'armed' | 'play'>('idle')
  onMount(() => {
    if (isBelowFold(card)) phase = 'armed'
  })
</script>

<section
  bind:this={card}
  class="card graph"
  data-state={phase}
  style:--base="{delay}ms"
  aria-label="Career as a git log"
  use:inview={{ enter: () => phase === 'armed' && (phase = 'play') }}
>
  <div class="legend">
    {#each LEGEND as item (item.lane)}
      <span class="legend-item">
        <i class="dot" style:--c={LANE_COLOR[item.lane]}></i>{item.label}
      </span>
    {/each}
    <span class="cmd">git log --graph</span>
  </div>

  <ol class="rows">
    {#each commits as commit, i (commit.hash)}
      <li class="item" style:--i={i} class:open={open === i}>
        <button
          type="button"
          class="row"
          aria-expanded={open === i}
          aria-controls="commit-{commit.hash}"
          onclick={() => toggle(i)}
        >
          <span class="lanes" aria-hidden="true">
            {#each LANES as lane (lane)}
              <span class="lane" class:hot={commit.lane === lane}>
                {#if lane === 'main' || i <= sideEnd}
                  <span class="line" style:--c={LANE_COLOR[lane]}></span>
                {/if}
                {#if commit.lane === lane}
                  <span class="node" style:--c={LANE_COLOR[lane]}></span>
                {/if}
              </span>
            {/each}
          </span>
          <span class="single" aria-hidden="true">
            <span class="line"></span>
            <span class="node" style:--c={LANE_COLOR[commit.lane]}></span>
          </span>
          <span class="hash">{commit.hash}</span>
          <span class="msg">
            <span class="type" style:color={LANE_INK[commit.lane]}
              >{commit.type}</span
            >
            {commit.message}
            <span class="meta-m">{commit.hash} · {commit.year}</span>
          </span>
          <span
            class="tag"
            style:--pill={LANE_COLOR[commit.lane]}
            style:--pill-ink={LANE_INK[commit.lane]}>{commit.tag}</span
          >
          <span class="year">{commit.year}</span>
        </button>

        {#if open === i}
          <div
            class="detail"
            id="commit-{commit.hash}"
            transition:slide={{
              duration: prefersReducedMotion.current ? 0 : 320,
              easing: cubicOut,
            }}
          >
            <span class="lanes" aria-hidden="true">
              {#each LANES as lane (lane)}
                <span class="lane">
                  {#if lane === 'main' || i < sideEnd}
                    <span class="line" style:--c={LANE_COLOR[lane]}></span>
                  {/if}
                </span>
              {/each}
            </span>
            <span class="single" aria-hidden="true"
              ><span class="line"></span></span
            >
            <div class="detail-body">
              <p>{commit.detail}</p>
              <a href={commit.href} class="view">{commit.linkLabel} →</a>
            </div>
          </div>
        {/if}
      </li>
    {/each}
  </ol>
</section>

<style>
  .graph {
    overflow: hidden;
    box-shadow: 0 20px 40px -28px rgb(0 0 0 / 0.25);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 18px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--divider);
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-3);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .legend .dot {
    width: 9px;
    height: 9px;
  }

  .cmd {
    margin-left: auto;
  }

  .rows {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .item {
    border-bottom: 1px solid var(--row-divider);
  }

  .item:last-child {
    border-bottom: 0;
  }

  .row,
  .detail {
    display: grid;
    grid-template-columns: 80px 90px minmax(0, 1fr) auto 70px;
    gap: 16px;
    align-items: center;
    width: 100%;
    padding: 0 20px;
    text-align: left;
  }

  .row {
    height: 58px;
    transition: background-color var(--dur-1) linear;
  }

  .row:hover,
  .item.open .row {
    background: var(--surface-muted);
  }

  .lanes {
    display: flex;
    align-self: stretch;
  }

  .lane {
    position: relative;
    display: flex;
    justify-content: center;
    width: 22px;
  }

  .line {
    width: 2px;
    height: 100%;
    background: var(--c);
    opacity: 0.85;
    transform-origin: top;
    transition: opacity var(--dur-2) linear;
  }

  .row:hover .lane.hot .line {
    opacity: 1;
  }

  .node {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 12px;
    height: 12px;
    margin: -6px 0 0 -6px;
    border-radius: 50%;
    background: var(--surface);
    border: 3px solid var(--c);
    transition: transform var(--dur-2) var(--ease-spring);
  }

  .row:hover .node {
    transform: scale(1.17);
  }

  .single {
    display: none;
  }

  .hash,
  .year {
    font-family: var(--font-mono);
    color: var(--ink-4);
  }

  .hash {
    font-size: 13px;
  }

  .year {
    font-size: 12px;
    text-align: right;
  }

  .msg {
    font-size: 15.5px;
    line-height: 1.35;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .type {
    font-family: var(--font-mono);
    font-weight: 500;
  }

  .meta-m {
    display: none;
  }

  .tag {
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid var(--pill);
    color: var(--pill-ink);
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1.4;
  }

  .detail {
    align-items: stretch;
    background: var(--surface-muted);
  }

  .detail .lanes {
    min-height: 100%;
  }

  .detail-body {
    grid-column: 2 / -1;
    padding: 2px 0 18px;
    font-size: 14.5px;
    line-height: 1.55;
    color: var(--ink-2);
  }

  .detail-body p {
    margin: 0 0 8px;
    max-width: 680px;
  }

  .view {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--blue-ink);
  }

  .view:hover {
    text-decoration: underline;
  }

  /* --- Entrance (MOTION §2, step 8) -------------------------------------- */
  /* Each row's segment draws in turn, so the lanes read as one line drawing
     downward over ~700ms; each dot pops as the line reaches it and each row
     slides in 60ms after the last. */

  :global(html[data-js]:not([data-ready])) .graph .row .line,
  .graph[data-state='armed'] .row .line {
    scale: 1 0;
  }

  :global(html[data-js]:not([data-ready])) .graph .row .node,
  .graph[data-state='armed'] .row .node {
    scale: 0;
  }

  :global(html[data-js]:not([data-ready])) .graph .row > :not(.lanes, .single),
  .graph[data-state='armed'] .row > :not(.lanes, .single) {
    opacity: 0;
  }

  :global(html[data-ready]) .graph:not([data-state='armed']) .row .line {
    animation: draw-down 117ms linear calc(var(--base) + var(--i) * 117ms) both;
  }

  :global(html[data-ready]) .graph:not([data-state='armed']) .row .node {
    animation: pop 300ms var(--ease-spring)
      calc(var(--base) + var(--i) * 117ms + 58ms) both;
  }

  :global(html[data-ready])
    .graph:not([data-state='armed'])
    .row
    > :not(.lanes, .single) {
    animation: row-in 400ms var(--ease-out) calc(var(--base) + var(--i) * 60ms)
      both;
  }

  .graph[data-state='play'] {
    --base: 0ms;
  }

  @keyframes row-in {
    from {
      opacity: 0;
      translate: -12px 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(html[data-ready]) .graph .row :is(.line, .node),
    :global(html[data-ready]) .graph .row > :not(.lanes, .single) {
      animation: fade-in 150ms linear both !important;
      scale: none;
    }
  }

  /* --- Narrower layouts ---------------------------------------------------- */

  @media (max-width: 1023px) {
    .row,
    .detail {
      grid-template-columns: 80px 80px minmax(0, 1fr) 50px;
    }

    .tag {
      display: none;
    }
  }

  /* Phones: one lane, the message wraps, hash · year underneath. */
  @media (max-width: 767px) {
    .graph {
      border-radius: 16px;
    }

    .legend {
      display: none;
    }

    .row,
    .detail {
      grid-template-columns: 22px minmax(0, 1fr);
      gap: 12px;
      padding: 0 14px;
    }

    .row {
      height: auto;
      align-items: stretch;
    }

    .lanes,
    .hash,
    .year {
      display: none;
    }

    .single {
      position: relative;
      display: flex;
      justify-content: center;
    }

    .single .line {
      background: var(--border);
      opacity: 1;
    }

    .single .node {
      top: 17px;
      margin-top: 0;
    }

    .item {
      border-bottom: 0;
    }

    .msg {
      padding: 12px 0;
      border-bottom: 1px solid var(--row-divider);
      font-size: 14px;
      white-space: normal;
    }

    .item:last-child .msg {
      border-bottom: 0;
    }

    .meta-m {
      display: block;
      margin-top: 3px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--ink-4);
    }

    .detail-body {
      grid-column: 2;
    }
  }
</style>
