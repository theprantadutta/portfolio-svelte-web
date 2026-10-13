<script lang="ts">
  import { onMount } from 'svelte'

  import CountUp from '#components/ui/CountUp.svelte'
  import {
    ACTIVITY_WEEKS,
    type Activity,
    type ContributionDay,
  } from '#lib/github.js'
  import { isBelowFold } from '#lib/motion/index.js'
  import { ambient } from '#lib/motion/ambient.js'
  import { inview } from '#lib/motion/inview.js'

  interface Props {
    activity: Activity
    stats: readonly { value: number; suffix: string; label: string }[]
    /** When the card's entrance starts, in the page's choreography. */
    delay?: number
  }

  let { activity, stats, delay = 420 }: Props = $props()

  // Swapped for a fresher copy from /api/github/activity after paint, so the
  // "live" label stays honest between deploys.
  let live = $state<Activity | null>(null)
  const current = $derived(live ?? activity)

  /** Every week padded to seven cells; future days in the last week are blank. */
  const weeks = $derived(
    current.weeks.slice(-ACTIVITY_WEEKS).map((week) => {
      const cells: (ContributionDay | null)[] = [...week]
      while (cells.length < 7) cells.push(null)
      return cells
    })
  )

  const fmt = (iso: string, options: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
      timeZone: 'UTC',
      ...options,
    })

  const plural = (n: number, word: string) =>
    `${n} ${word}${n === 1 ? '' : 's'}`

  // --- Tooltip ----------------------------------------------------------------
  // Positioned against the card rather than the grid, because the grid sits
  // in a horizontal scroller that would clip it. Top rows show it below the
  // cell so it never runs off the card.
  let tip = $state<{
    day: string
    week: string
    x: number
    y: number
    below: boolean
  } | null>(null)

  const TIP_HALF_WIDTH = 90

  const onPointerOver = (event: PointerEvent) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-date]'
    )
    if (!cell) return
    const { date, count, week, weekTotal, row } = cell.dataset
    const cardRect = card.getBoundingClientRect()
    const rect = cell.getBoundingClientRect()
    const below = Number(row) < 3
    const x = rect.left - cardRect.left + rect.width / 2
    tip = {
      day: `${fmt(date!, { weekday: 'short', month: 'short', day: 'numeric' })} · ${plural(Number(count), 'contribution')}`,
      week: `week of ${fmt(week!, { month: 'short', day: 'numeric' })} · ${plural(Number(weekTotal), 'contribution')}`,
      x: Math.min(Math.max(x, TIP_HALF_WIDTH), cardRect.width - TIP_HALF_WIDTH),
      y: below ? rect.bottom - cardRect.top + 8 : rect.top - cardRect.top - 8,
      below,
    }
  }

  // --- Entrance ---------------------------------------------------------------
  // On page load the columns fill left to right with the hero (CSS, gated on
  // data-ready). If the card starts offscreen it is re-armed and plays when
  // scrolled to instead.
  let card: HTMLElement
  let phase = $state<'idle' | 'armed' | 'play'>('idle')

  onMount(() => {
    if (isBelowFold(card)) phase = 'armed'

    let cancelled = false
    fetch('/api/github/activity')
      .then((response) => (response.ok ? response.json() : null))
      .then((fresh: Activity | null) => {
        if (
          !cancelled &&
          fresh?.weeks?.length &&
          fresh.fetchedAt > activity.fetchedAt
        ) {
          live = fresh
        }
      })
      .catch(() => {
        // The build's copy is already on screen.
      })
    return () => {
      cancelled = true
    }
  })
</script>

<section
  bind:this={card}
  class="card heat-card enter-x"
  data-state={phase}
  style:--d="{delay}ms"
  aria-labelledby="activity-title"
  use:inview={{ enter: () => phase === 'armed' && (phase = 'play') }}
>
  <div class="head">
    <h2 id="activity-title">activity · last {ACTIVITY_WEEKS} weeks</h2>
    <span>live</span>
  </div>

  <div class="scroller" data-lenis-prevent>
    <div
      class="grid"
      role="img"
      aria-label="{current.total.toLocaleString(
        'en-US'
      )} contributions on GitHub in the last {ACTIVITY_WEEKS} weeks"
      onpointerover={onPointerOver}
      onpointerleave={() => (tip = null)}
    >
      {#each weeks as week, col (col)}
        {@const weekTotal = week.reduce(
          (sum, day) => sum + (day?.count ?? 0),
          0
        )}
        <div class="col" style:--col={col}>
          {#each week as day, row (row)}
            {#if day}
              <span
                class="cell"
                style:background="var(--heat-{day.level})"
                data-date={day.date}
                data-count={day.count}
                data-week={week[0]?.date}
                data-week-total={weekTotal}
                data-row={row}
              ></span>
            {:else}
              <span class="cell empty"></span>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  </div>

  {#if tip}
    <div
      class="tip"
      class:below={tip.below}
      style:left="{tip.x}px"
      style:top="{tip.y}px"
      aria-hidden="true"
    >
      <b>{tip.day}</b>
      <span>{tip.week}</span>
    </div>
  {/if}

  <div class="sweep ambient" use:ambient aria-hidden="true"></div>

  <dl class="stats">
    {#each stats as stat (stat.label)}
      <div>
        <dt>{stat.label}</dt>
        <dd><CountUp value={stat.value} suffix={stat.suffix} delay={600} /></dd>
      </div>
    {/each}
  </dl>
</section>

<style>
  .heat-card {
    padding: 18px;
    overflow: hidden;
    box-shadow: 0 20px 40px -28px rgb(0 0 0 / 0.3);
  }

  .head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-3);
  }

  .head h2 {
    margin: 0;
    font: inherit;
  }

  .scroller {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
  }

  .grid {
    --cell: 14px;
    --gap: 4px;
    position: relative;
    display: flex;
    gap: var(--gap);
    width: max-content;
  }

  .col {
    display: grid;
    grid-template-rows: repeat(7, var(--cell));
    gap: var(--gap);
    scroll-snap-align: start;
    transition: opacity var(--dur-2) linear;
  }

  /* Hovering a column dims the others to half (MOTION §4 "Heatmap"). */
  @media (hover: hover) {
    .grid:has(.col:hover) .col:not(:hover) {
      opacity: 0.5;
    }
  }

  .cell {
    width: var(--cell);
    height: var(--cell);
    border-radius: 3px;
    transition: transform var(--dur-1) var(--ease-out);
  }

  .cell.empty {
    visibility: hidden;
  }

  @media (hover: hover) {
    .cell:not(.empty):hover {
      transform: scale(1.25);
    }
  }

  /* Column-by-column fill, 12ms apart, with the hero choreography. Whole
     columns animate rather than single cells: 26 compositor layers instead
     of 182, which was a measurable share of the home page's main-thread time
     on phones. `backwards` (not `both`) so a finished entrance never
     overrides the hover dimming above. */
  :global(html[data-js]:not([data-ready])) .col {
    opacity: 0;
  }

  :global(html[data-ready]) .heat-card:not([data-state='armed']) .col {
    animation: cell-in 300ms var(--ease-out)
      calc(var(--d) + 120ms + var(--col) * 12ms) backwards;
  }

  .heat-card[data-state='armed'] .col {
    opacity: 0;
  }

  .heat-card[data-state='play'] .col {
    animation: cell-in 300ms var(--ease-out) calc(var(--col) * 12ms) backwards;
    --d: 0ms;
  }

  .tip {
    position: absolute;
    z-index: 3;
    translate: -50% -100%;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 7px 10px;
    border-radius: 8px;
    background: var(--ink);
    color: var(--on-ink);
    font-family: var(--font-mono);
    font-size: 11px;
    white-space: nowrap;
    pointer-events: none;
  }

  .tip.below {
    translate: -50% 0;
  }

  .tip b {
    font-weight: 500;
  }

  .tip span {
    opacity: 0.65;
  }

  .sweep {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 120px;
    background: linear-gradient(90deg, transparent, var(--sweep), transparent);
    pointer-events: none;
    animation: sweep 3.5s ease-in-out calc(var(--d) + 900ms) infinite;
    animation-fill-mode: backwards;
    transform: translateX(-100%);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin: 16px 0 0;
    padding-top: 14px;
    border-top: 1px solid var(--divider);
  }

  .stats div {
    display: flex;
    flex-direction: column-reverse;
  }

  .stats dd {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .stats dt {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-3);
  }

  @media (max-width: 767px) {
    .heat-card {
      padding: 12px;
      border-radius: 16px;
    }

    .head {
      display: none;
    }

    .grid {
      --cell: 9px;
      --gap: 3px;
    }

    .cell {
      border-radius: 2px;
    }

    .sweep {
      width: 80px;
    }

    .stats dd {
      font-size: 20px;
    }
  }
</style>
