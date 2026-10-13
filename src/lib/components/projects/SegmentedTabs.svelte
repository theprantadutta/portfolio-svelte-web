<script lang="ts" generics="T extends string">
  import { onMount, tick } from 'svelte'
  import { Spring } from 'svelte/motion'

  import { SPRING_UI } from '#lib/motion/index.js'

  interface Props {
    tabs: readonly { id: T; label: string }[]
    value: T
    /** Prefix for tab/panel ids, so the panels can point back at their tab. */
    idPrefix: string
    onchange: (value: T) => void
  }

  let { tabs, value, idPrefix, onchange }: Props = $props()

  // One dark pill springs between tabs; until hydration the selected tab
  // paints its own.
  let list: HTMLElement
  let sliding = $state(false)
  const pill = new Spring({ x: 0, w: 0 }, SPRING_UI)

  const measure = (instant: boolean) => {
    const active = list?.querySelector<HTMLElement>('[aria-selected="true"]')
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
    observer.observe(list)
    return () => observer.disconnect()
  })

  // Arrow keys move between tabs, as the ARIA tabs pattern expects.
  const onKeydown = (event: KeyboardEvent) => {
    const index = tabs.findIndex((tab) => tab.id === value)
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    let next = index
    if (step) next = (index + step + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    onchange(tabs[next].id)
    tick().then(() =>
      list.querySelector<HTMLElement>('[aria-selected="true"]')?.focus()
    )
  }
</script>

<div
  class="tabs"
  class:sliding
  role="tablist"
  tabindex="-1"
  bind:this={list}
  onkeydown={onKeydown}
>
  <span
    class="pill"
    aria-hidden="true"
    style:transform="translateX({pill.current.x}px)"
    style:width="{pill.current.w}px"
  ></span>
  {#each tabs as tab (tab.id)}
    <button
      type="button"
      role="tab"
      id="{idPrefix}-tab-{tab.id}"
      aria-controls="{idPrefix}-panel"
      aria-selected={tab.id === value}
      tabindex={tab.id === value ? 0 : -1}
      onclick={() => onchange(tab.id)}
    >
      {tab.label}
    </button>
  {/each}
</div>

<style>
  .tabs {
    position: relative;
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .pill {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 0;
    border-radius: 9px;
    background: var(--ink);
    visibility: hidden;
    pointer-events: none;
  }

  .sliding .pill {
    visibility: visible;
  }

  button {
    position: relative;
    min-height: 36px;
    padding: 8px 14px;
    border-radius: 9px;
    color: var(--ink-2);
    white-space: nowrap;
    transition: color var(--dur-3) var(--ease-in-out);
  }

  button[aria-selected='true'] {
    background: var(--ink);
    color: var(--on-ink);
  }

  .sliding button[aria-selected='true'] {
    background: transparent;
  }

  button:hover:not([aria-selected='true']) {
    color: var(--ink);
  }

  @media (max-width: 767px) {
    .tabs {
      overflow-x: auto;
      scrollbar-width: none;
    }

    button {
      min-height: 40px;
      padding: 8px 12px;
    }
  }
</style>
