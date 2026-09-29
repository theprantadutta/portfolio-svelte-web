<script lang="ts">
  import { sectionInView } from '$lib/actions/section-in-view'
  import { getActiveSectionState } from '$lib/context/active-section.svelte'
  import type { ISectionName } from '$lib/types/section'

  /**
   * Lightweight sentinel that keeps the active-section context in sync without
   * turning whole sections into interactive components. Renders a zero-size
   * span inside the section it names; everything around it stays static
   * prerendered HTML.
   */
  interface Props {
    section: ISectionName
    class?: string
  }

  let { section, class: className = 'block h-0 w-0 opacity-0' }: Props =
    $props()

  const state = getActiveSectionState()
</script>

<span
  use:sectionInView={{ state, section }}
  data-section-marker={section}
  class={className}
></span>
