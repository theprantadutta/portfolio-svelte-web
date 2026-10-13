<script lang="ts">
  interface Props {
    text: string
    /** When the first word starts, in ms after the page is ready. */
    delay?: number
    /** Gap between words (MOTION §2: 50ms). */
    stagger?: number
  }

  let { text, delay = 0, stagger = 50 }: Props = $props()

  const words = $derived(text.split(/\s+/).filter(Boolean))
</script>

<!--
  Each word rises out of its own overflow mask (`.word` in app.css). Spaces
  sit between the masks as real text, so the line still wraps, copies and
  reads as one sentence.
-->
<!-- eslint-disable-next-line svelte/no-useless-mustaches -- a literal space at the edge of a block would be trimmed -->
{#each words as word, i (i)}{#if i > 0}{' '}{/if}<span class="word"
    ><span style:--d="{delay + i * stagger}ms">{word}</span></span
  >{/each}
