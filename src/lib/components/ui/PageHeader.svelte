<script lang="ts">
  import type { Snippet } from 'svelte'

  import WordReveal from '#components/ui/WordReveal.svelte'

  interface Props {
    /** The shell command above the title, e.g. "$ ls ~/projects --sort=impact" */
    command: string
    title: string
    /** Anything aligned to the right of the title: filters, search, totals. */
    aside?: Snippet
  }

  let { command, title, aside }: Props = $props()
</script>

<!-- The section header every inner page opens with (README "Global layout"). -->
<header class="page-header">
  <div class="titles">
    <p class="eyebrow">
      <span class="type-on" style:--chars={command.length}>{command}</span>
    </p>
    <h1 class="h-page"><WordReveal text={title} delay={160} /></h1>
  </div>
  {#if aside}
    <div class="aside enter" style:--d="360ms">{@render aside()}</div>
  {/if}
</header>

<style>
  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }

  .titles {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .eyebrow {
    margin: 0;
  }

  .type-on {
    display: inline-block;
  }

  .aside {
    flex: none;
  }

  @media (max-width: 1023px) {
    .page-header {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
  }

  /* Phones open on the title alone; the nav already shows the ~/route. */
  @media (max-width: 767px) {
    .eyebrow {
      display: none;
    }
  }
</style>
