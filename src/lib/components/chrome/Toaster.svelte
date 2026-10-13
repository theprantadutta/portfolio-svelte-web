<script lang="ts">
  import { flip } from 'svelte/animate'

  import { prefersReducedMotion } from '#lib/motion/index.js'
  import { toast } from '#lib/toast.svelte.js'

  const slide = (_node: Element) => ({
    duration: prefersReducedMotion.current ? 0 : 240,
    css: (t: number) =>
      `opacity: ${t}; transform: translateY(${(1 - t) * 12}px)`,
  })
</script>

<div class="toaster" role="status" aria-live="polite">
  {#each toast.toasts as item (item.id)}
    <button
      type="button"
      class="toast"
      class:error={item.kind === 'error'}
      transition:slide
      animate:flip={{ duration: 200 }}
      onclick={() => toast.dismiss(item.id)}
    >
      {#if item.kind === 'success'}<span class="ok">✓</span>{/if}
      {#if item.kind === 'error'}<span class="bad">✗</span>{/if}
      {item.message}
    </button>
  {/each}
</div>

<style>
  .toaster {
    position: fixed;
    z-index: 80;
    left: 50%;
    bottom: max(20px, env(safe-area-inset-bottom));
    translate: -50% 0;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 8px;
    pointer-events: none;
  }

  .toast {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: calc(100vw - 32px);
    padding: 10px 16px;
    border-radius: 999px;
    background: #15171c;
    color: #ecedf0;
    font-family: var(--font-mono);
    font-size: 13px;
    box-shadow: 0 12px 30px -12px rgb(0 0 0 / 0.5);
    pointer-events: auto;
  }

  :global([data-theme='dark']) .toast {
    background: #ecedf0;
    color: #15171c;
  }

  .ok {
    color: oklch(0.75 0.15 150);
  }

  .bad {
    color: oklch(0.7 0.15 25);
  }

  :global([data-theme='dark']) .ok {
    color: oklch(0.5 0.15 150);
  }

  :global([data-theme='dark']) .bad {
    color: oklch(0.55 0.15 25);
  }
</style>
