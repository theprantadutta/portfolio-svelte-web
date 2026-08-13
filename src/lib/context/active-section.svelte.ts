import { getContext, setContext } from 'svelte'

import type { ISectionName } from '$lib/types/section'

const KEY = Symbol('active-section')

/**
 * Tracks which portfolio section is in view so the nav can highlight it.
 *
 * `timeOfLastClick` exists to suppress the observer for a moment after a nav
 * click: without it, scrolling through intermediate sections on the way to the
 * target would repeatedly steal the highlight.
 */
export class ActiveSectionState {
  activeSection = $state<ISectionName>('Home')
  timeOfLastClick = $state(0)

  setActiveSection = (section: ISectionName) => {
    this.activeSection = section
  }

  registerClick = (section: ISectionName) => {
    this.activeSection = section
    this.timeOfLastClick = Date.now()
  }
}

export const setActiveSectionState = () =>
  setContext(KEY, new ActiveSectionState())

export const getActiveSectionState = () => {
  const state = getContext<ActiveSectionState | undefined>(KEY)
  if (!state) {
    throw new Error(
      'getActiveSectionState must be used within an active-section provider'
    )
  }
  return state
}
