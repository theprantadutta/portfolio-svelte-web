import type { Action } from 'svelte/action'

import { prefersReducedMotion } from '.'

const GLYPHS = '!<>-_\\/[]{}=+*^?#$%'
const FRAMES = 6
const FRAME_MS = 40

/**
 * Re-types an element's text on hover: six frames of random mono glyphs, then
 * it settles (MOTION §4, `git push hire`). Spaces stay put so the word shapes
 * survive, and the width never changes because the font is monospaced.
 */
export const scramble: Action<HTMLElement> = (node) => {
  const original = node.textContent ?? ''
  let timer: ReturnType<typeof setInterval> | undefined

  const run = () => {
    if (timer || prefersReducedMotion.current) return
    let frame = 0
    timer = setInterval(() => {
      frame++
      if (frame > FRAMES) {
        clearInterval(timer)
        timer = undefined
        node.textContent = original
        return
      }
      // Settle left to right: each frame locks in a little more of the word.
      const settled = Math.floor((frame / FRAMES) * original.length)
      node.textContent = [...original]
        .map((char, i) =>
          i < settled || char === ' '
            ? char
            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        )
        .join('')
    }, FRAME_MS)
  }

  node.addEventListener('pointerenter', run)
  return {
    destroy: () => {
      node.removeEventListener('pointerenter', run)
      clearInterval(timer)
      node.textContent = original
    },
  }
}
