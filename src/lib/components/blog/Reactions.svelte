<script lang="ts">
  import { prefersReducedMotion } from '#lib/motion/index.js'
  import { REACTIONS, type ReactionEmoji } from '#lib/reactions.js'
  import { copyText } from '#lib/toast.svelte.js'
  import type { PostReactions } from './post-reactions.svelte'

  interface Props {
    reactions: PostReactions
    /** `card` in the desktop sidebar, `bar` floating at the bottom on phones. */
    variant: 'card' | 'bar'
    /** For the bar's share button. */
    title?: string
  }

  let { reactions, variant, title = '' }: Props = $props()

  interface Particle {
    id: number
    dx: number
    dy: number
    rotate: number
  }

  let nextId = 0
  let pops = $state<Record<ReactionEmoji, number>>({
    heart: 0,
    fire: 0,
    rocket: 0,
    eyes: 0,
  })
  let particles = $state<Record<ReactionEmoji, Particle[]>>({
    heart: [],
    fire: [],
    rocket: [],
    eyes: [],
  })

  /**
   * MOTION §4 "Reactions": the emoji pops, the count flips, and adding one
   * throws a few tiny copies upward within ±30° of vertical.
   */
  const tap = (emoji: ReactionEmoji) => {
    const added = reactions.toggle(emoji)
    if (prefersReducedMotion.current) return
    pops[emoji]++
    if (!added) return

    const burst: Particle[] = Array.from(
      { length: 4 + Math.floor(Math.random() * 3) },
      () => {
        const angle = ((Math.random() * 60 - 30) * Math.PI) / 180
        const distance = 34 + Math.random() * 26
        return {
          id: nextId++,
          dx: Math.sin(angle) * distance,
          dy: -Math.cos(angle) * distance,
          rotate: Math.random() * 60 - 30,
        }
      }
    )
    particles[emoji] = [...particles[emoji], ...burst]
    const ids = new Set(burst.map((p) => p.id))
    setTimeout(() => {
      particles[emoji] = particles[emoji].filter((p) => !ids.has(p.id))
    }, 520)
  }

  const share = async () => {
    const url = window.location.href.split('#')[0]
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        // Dismissing the share sheet is not a failure worth reporting.
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    await copyText(url, 'link copied')
  }
</script>

{#snippet buttons()}
  {#each REACTIONS as reaction (reaction.id)}
    {@const count = reactions.counts[reaction.id]}
    {@const on = reactions.mine[reaction.id]}
    <button
      type="button"
      class="reaction"
      class:on
      aria-pressed={on}
      aria-label="{reaction.label}: {count}"
      onclick={() => tap(reaction.id)}
    >
      {#key pops[reaction.id]}
        <span
          class="emoji"
          class:pop={pops[reaction.id] > 0}
          aria-hidden="true"
        >
          {reaction.emoji}
        </span>
      {/key}
      <span class="count tabular" aria-hidden="true">
        {#key count}<span class="digits">{count}</span>{/key}
      </span>
      {#each particles[reaction.id] as particle (particle.id)}
        <span
          class="particle"
          aria-hidden="true"
          style:--dx="{particle.dx}px"
          style:--dy="{particle.dy}px"
          style:--rot="{particle.rotate}deg">{reaction.emoji}</span
        >
      {/each}
    </button>
  {/each}
{/snippet}

{#if variant === 'card'}
  <section class="card reactions-card" aria-labelledby="reactions-title">
    <h2 id="reactions-title" class="label">REACTIONS</h2>
    <div class="list">{@render buttons()}</div>
  </section>
{:else}
  <div class="bar" role="group" aria-label="Reactions">
    {@render buttons()}
    <button type="button" class="share" onclick={share}>share</button>
  </div>
{/if}

<style>
  .reactions-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    border-radius: 16px;
    box-shadow: none;
  }

  .label {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.12em;
    color: var(--ink-4);
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .reaction {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 36px;
    padding: 7px 11px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--surface);
    color: var(--ink);
    font-size: 14px;
    line-height: 1;
    transition:
      border-color var(--dur-2) var(--ease-out),
      background-color var(--dur-2) var(--ease-out);
  }

  .reaction:hover {
    border-color: var(--ink-4);
  }

  .reaction.on {
    border-color: var(--blue);
    background: oklch(0.95 0.03 230);
  }

  :global([data-theme='dark']) .reaction.on {
    background: color-mix(in oklch, var(--blue) 18%, var(--surface));
  }

  .emoji {
    display: inline-block;
  }

  .emoji.pop {
    animation: emoji-pop 300ms var(--ease-spring);
  }

  @keyframes emoji-pop {
    50% {
      scale: 1.35;
    }
  }

  .count {
    display: inline-grid;
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 12px;
  }

  .digits {
    grid-area: 1 / 1;
    animation: count-flip 260ms var(--ease-out);
  }

  @keyframes count-flip {
    from {
      opacity: 0;
      translate: 0 70%;
    }
  }

  .particle {
    position: absolute;
    left: 10px;
    top: 50%;
    font-size: 12px;
    pointer-events: none;
    animation: particle 500ms var(--ease-out) forwards;
  }

  @keyframes particle {
    from {
      opacity: 1;
      transform: translate(0, -50%) rotate(0) scale(0.8);
    }
    to {
      opacity: 0;
      transform: translate(var(--dx), calc(-50% + var(--dy))) rotate(var(--rot))
        scale(1);
    }
  }

  /* The phone version: a dark bar floating over the article (M4). */
  .bar {
    position: fixed;
    z-index: 30;
    left: 14px;
    right: 14px;
    bottom: max(14px, env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border-radius: 18px;
    background: rgb(21 23 28 / 0.92);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 16px 40px -16px rgb(0 0 0 / 0.5);
  }

  .bar .reaction {
    min-height: 44px;
    padding: 9px 10px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: #fff;
  }

  .bar .reaction.on {
    background: rgb(255 255 255 / 0.18);
  }

  .share {
    margin-left: auto;
    min-height: 44px;
    padding: 9px 14px;
    border-radius: 12px;
    background: #fff;
    color: #15171c;
    font-family: var(--font-mono);
    font-size: 12px;
  }

  @media (prefers-reduced-motion: reduce) {
    .emoji.pop,
    .digits,
    .particle {
      animation: none;
    }
  }
</style>
