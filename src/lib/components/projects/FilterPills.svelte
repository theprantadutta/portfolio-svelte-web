<script lang="ts" generics="T extends string">
  import { onMount, tick } from 'svelte'
  import { Spring } from 'svelte/motion'

  import { SPRING_UI } from '$lib/motion'

  interface Props {
    options: readonly T[]
    value: T
    counts: Record<T, number>
    label: string
    onchange: (value: T) => void
  }

  let { options, value, counts, label, onchange }: Props = $props()

  /**
   * The dark active pill is one element that springs between options
   * (MOTION §4 "Filters"), like the nav underline. Before hydration each
   * button paints its own active state, so the prerendered page is right.
   */
  let row: HTMLElement
  let sliding = $state(false)
  const pill = new Spring({ x: 0, w: 0 }, SPRING_UI)

  const measure = (instant: boolean) => {
    const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!active) return
    pill.set({ x: active.offsetLeft, w: active.offsetWidth }, { instant })
  }

  $effect(() => {
    void value
    tick().then(() => {
      measure(!sliding)
      sliding = true
    })
  })

  onMount(() => {
    const observer = new ResizeObserver(() => measure(true))
    observer.observe(row)
    return () => observer.disconnect()
  })
</script>

<div
  class="filters"
  class:sliding
  role="group"
  aria-label={label}
  bind:this={row}
>
  <span
    class="pill-bg"
    aria-hidden="true"
    style:transform="translateX({pill.current.x}px)"
    style:width="{pill.current.w}px"
  ></span>
  {#each options as option (option)}
    <button
      type="button"
      class="filter"
      aria-pressed={option === value}
      onclick={() => onchange(option)}
    >
      {option}
      <span class="count tabular">{counts[option]}</span>
    </button>
  {/each}
</div>

<style>
  .filters {
    position: relative;
    display: flex;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .pill-bg {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border-radius: 999px;
    background: var(--ink);
    pointer-events: none;
    visibility: hidden;
  }

  .sliding .pill-bg {
    visibility: visible;
  }

  .filter {
    position: relative;
    flex: none;
    min-height: 38px;
    padding: 9px 14px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--surface);
    color: var(--ink);
    white-space: nowrap;
    transition:
      color var(--dur-3) var(--ease-in-out),
      border-color var(--dur-3) var(--ease-in-out),
      background-color var(--dur-3) var(--ease-in-out);
  }

  .filter[aria-pressed='true'] {
    border-color: var(--ink);
    background: var(--ink);
    color: var(--on-ink);
  }

  /* Once the shared pill exists, the button goes see-through above it. */
  .sliding .filter[aria-pressed='true'] {
    background: transparent;
  }

  .filter:hover:not([aria-pressed='true']) {
    border-color: var(--ink);
  }

  .count {
    opacity: 0.55;
  }

  @media (max-width: 767px) {
    .filters {
      gap: 6px;
      overflow-x: auto;
      margin-inline: calc(-1 * var(--gutter));
      padding-inline: var(--gutter);
      scrollbar-width: none;
      font-size: 12px;
    }

    .pill-bg {
      left: 0;
    }

    .filter {
      min-height: 44px;
      padding: 8px 14px;
    }

    .count {
      display: none;
    }
  }
</style>
