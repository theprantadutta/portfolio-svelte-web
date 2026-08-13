import { getContext, setContext } from 'svelte'
import { browser } from '$app/environment'

type Theme = 'light' | 'dark'

const KEY = Symbol('theme')

/**
 * Dark/light theme with localStorage persistence and system-preference
 * fallback — the runes equivalent of the old ThemeContextProvider.
 *
 * The class in `<html>` is applied before first paint by the inline script in
 * app.html, so this only has to stay in sync with what that script already
 * decided. Reading it back from the DOM (rather than defaulting to 'dark' and
 * correcting in an effect, as the React version did) means the toggle icon is
 * correct on its very first render instead of flipping a frame later.
 */
export class ThemeState {
  theme = $state<Theme>('dark')

  constructor() {
    if (!browser) return

    const stored = window.localStorage.getItem('theme') as Theme | null
    if (stored === 'light' || stored === 'dark') {
      this.theme = stored
    } else {
      this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }

    this.#apply()
  }

  #apply() {
    document.documentElement.classList.toggle('dark', this.theme === 'dark')
  }

  toggleTheme = () => {
    this.theme = this.theme === 'light' ? 'dark' : 'light'
    window.localStorage.setItem('theme', this.theme)
    this.#apply()
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
