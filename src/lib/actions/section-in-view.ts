import { observeElement, unobserveElement } from '$lib/observer-manager'
import type { ActiveSectionState } from '$lib/context/active-section.svelte'
import type { ISectionName } from '$lib/types/section'

interface SectionInViewParams {
  state: ActiveSectionState
  section: ISectionName
  threshold?: number
}

/**
 * Marks the host element as the sentinel for a nav section — the action form of
 * the old `useSectionInView` hook.
 *
 * `SectionMarker` applies this to a zero-size span; `Skills` applies it to the
 * whole <section>, matching how each was wired in the React version. Both share
 * the pooled observer in observer-manager.
 */
export const sectionInView = (
  node: HTMLElement,
  { state, section, threshold = 0.75 }: SectionInViewParams
) => {
  const options = { threshold, root: null, rootMargin: '0px' }

  observeElement(
    node,
    (entry) => {
      // Ignore the observer briefly after a nav click, so scrolling past
      // intermediate sections can't steal the highlight from the target.
      if (entry.isIntersecting && Date.now() - state.timeOfLastClick > 1000) {
        state.setActiveSection(section)
      }
    },
    options
  )

  return {
    destroy() {
      unobserveElement(node, options)
    },
  }
}
