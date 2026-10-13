<script lang="ts">
  import { onMount } from 'svelte'

  import { diffBlocks, type PullRequestView } from '#components/oss/pr.js'
  import CountUp from '#components/ui/CountUp.svelte'
  import { isBelowFold } from '#lib/motion/index.js'
  import { inview } from '#lib/motion/inview.js'
  import { spotlight } from '#lib/motion/pointer.js'

  interface Props {
    pr: PullRequestView
    /** Position in the grid, for the entrance stagger. */
    index: number
    /** Opens the page's detail dialog on this pull request. */
    onselect: (pr: PullRequestView) => void
  }

  let { pr, index, onselect }: Props = $props()

  const blocks = $derived(diffBlocks(pr))

  // The squares fill one by one and the badge pulses once, with the page if
  // the card is on screen at load, otherwise the first time it scrolls in.
  let card: HTMLElement
  let phase = $state<'idle' | 'armed' | 'play'>('idle')
  onMount(() => {
    if (isBelowFold(card)) phase = 'armed'
  })
</script>

<!-- A summary only: the whole card opens the details in a dialog, so a
     card never grows and drags its row with it. -->
<article
  bind:this={card}
  class="card lift spotlight pr"
  data-phase={phase}
  style:--spot="var(--purple)"
  style:--n={index}
  use:spotlight
  use:inview={{ enter: () => phase === 'armed' && (phase = 'play') }}
>
  <button
    type="button"
    class="summary"
    aria-haspopup="dialog"
    aria-label="{pr.title}, {pr.repo} pull request {pr.number}: show details"
    onclick={() => onselect(pr)}
  >
    <span class="top">
      <span class="repo">{pr.repo}</span>
      <span class="merged"><span aria-hidden="true">⇄</span> merged</span>
    </span>
    <span class="title">{pr.title}</span>
    <span class="diff">
      {#if pr.additions !== null && pr.deletions !== null}
        <span class="add"><CountUp value={pr.additions} prefix="+" /></span>
        <span class="del"><CountUp value={pr.deletions} prefix="−" /></span>
      {/if}
      <span class="blocks" aria-hidden="true">
        {#each blocks as kind, i (i)}
          <i class={kind} style:--b={i}></i>
        {/each}
      </span>
    </span>
  </button>
</article>

<style>
  .pr {
    display: flex;
    flex-direction: column;
    border-radius: 18px;
  }

  .summary {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    padding: 20px;
    text-align: left;
    color: inherit;
    border-radius: 18px;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .repo {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-2);
  }

  .merged {
    flex: none;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--purple);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.3;
  }

  :global([data-theme='dark']) .merged {
    color: #15171c;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--ink);
  }

  .diff {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: auto;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .add {
    color: var(--green-ink);
  }

  .del {
    color: var(--red-ink);
  }

  .blocks {
    display: flex;
    gap: 2px;
    margin-left: auto;
  }

  .blocks i {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .blocks .add {
    background: var(--green);
  }

  .blocks .del {
    background: var(--red);
  }

  .blocks .none {
    background: var(--chip);
  }

  /* Squares fill 40ms apart; the badge glows once (MOTION §4 "Open-source"). */
  :global(html[data-js]:not([data-ready])) .blocks i,
  .pr[data-phase='armed'] .blocks i {
    scale: 0;
  }

  :global(html[data-ready]) .pr[data-phase='idle'] .blocks i {
    animation: pop 300ms var(--ease-spring)
      calc(600ms + var(--n) * 50ms + var(--b) * 40ms) both;
  }

  :global(html[data-ready]) .pr[data-phase='idle'] .merged {
    animation: merged-glow 1.2s var(--ease-out) calc(600ms + var(--n) * 50ms) 1;
  }

  .pr[data-phase='play'] .blocks i {
    animation: pop 300ms var(--ease-spring) calc(var(--b) * 40ms) both;
  }

  .pr[data-phase='play'] .merged {
    animation: merged-glow 1.2s var(--ease-out) 1;
  }

  @keyframes merged-glow {
    0% {
      box-shadow: 0 0 0 0 color-mix(in oklch, var(--purple) 55%, transparent);
    }
    100% {
      box-shadow: 0 0 0 10px color-mix(in oklch, var(--purple) 0%, transparent);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .blocks i,
    .merged {
      animation: none !important;
      scale: none !important;
    }
  }
</style>
