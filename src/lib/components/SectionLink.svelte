<script lang="ts">
  import type { Snippet } from 'svelte'

  import { getActiveSectionState } from '$lib/context/active-section.svelte'
  import type { ISectionName } from '$lib/types/section'

  /**
   * A plain anchor that also records the click in the active-section context,
   * so the nav highlight jumps to the target immediately instead of waiting
   * for the scroll to land.
   */
  interface Props {
    href: string
    section: ISectionName
    class?: string
    children: Snippet
    onclick?: (event: MouseEvent) => void
  }

  let {
    href,
    section,
    class: className = '',
    children,
    onclick,
  }: Props = $props()

  const active = getActiveSectionState()

  const handleClick = (event: MouseEvent) => {
    onclick?.(event)
    active.registerClick(section)
  }
</script>

<a {href} class={className} onclick={handleClick}>
  {@render children()}
</a>
