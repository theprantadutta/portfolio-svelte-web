import { getContext, setContext } from 'svelte'
import { browser } from '$app/environment'
import { prefersReducedMotion } from 'svelte/motion'

type Theme = 'light' | 'dark'

const KEY = Symbol('theme')
const STORAGE_KEY = 'theme'

/**
 * Light/dark theme, persisted to localStorage and defaulting to the OS
 * preference.
 *
 * `data-theme` on <html> is set before first paint by the inline script in
 * app.html; this class only reads it back and keeps it in sync. The toggle's
 * icons are switched by CSS from that same attribute, so the prerendered page
 * already shows the right one and nothing swaps after hydration.
 */
export class ThemeState {
  theme = $state<Theme>('light')

  constructor() {
    if (!browser) return
    this.theme =
      document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  }

  #apply(theme: Theme) {
    this.theme = theme
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Private mode or storage disabled: the switch still works this visit.
    }
  }

  /**
   * Switches theme. With a point (the toggle button's centre), the new theme
   * is revealed in a circle growing from it (MOTION §4 "Theme toggle"); where
   * view transitions are unsupported, or motion is reduced, colours
   * cross-fade instead.
   */
  toggle = (origin?: { x: number; y: number }) => {
    const next: Theme = this.theme === 'light' ? 'dark' : 'light'
    const root = document.documentElement

    if (!document.startViewTransition || prefersReducedMotion.current) {
      root.dataset.themeFade = ''
      this.#apply(next)
      setTimeout(() => delete root.dataset.themeFade, 250)
      return
    }

    if (origin) {
      root.style.setProperty('--vt-x', `${origin.x}px`)
      root.style.setProperty('--vt-y', `${origin.y}px`)
    }
    root.dataset.vt = 'theme'
    const transition = document.startViewTransition(() => this.#apply(next))
    transition.finished.finally(() => delete root.dataset.vt)
  }
}

export const setThemeState = () => setContext(KEY, new ThemeState())

export const getThemeState = () => {
  const state = getContext<ThemeState | undefined>(KEY)
  if (!state) {
    throw new Error('getThemeState must be used within a theme provider')
  }
  return state
}
