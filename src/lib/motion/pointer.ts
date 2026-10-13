import type { Action } from 'svelte/action'

import { finePointer, prefersReducedMotion } from '.'

/**
 * Cursor spotlight (MOTION §4 "Cards"): writes the pointer position into
 * --mx/--my so the `.spotlight::before` gradient in app.css can follow it.
 * Throttled to one write per frame, and only wired up for fine pointers,
 * where a hover exists to begin with.
 */
export const spotlight: Action<HTMLElement> = (node) => {
  if (!finePointer()) return

  let frame = 0
  let x = 0
  let y = 0

  const onMove = (event: PointerEvent) => {
    x = event.clientX
    y = event.clientY
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      const rect = node.getBoundingClientRect()
      node.style.setProperty('--mx', `${x - rect.left}px`)
      node.style.setProperty('--my', `${y - rect.top}px`)
    })
  }

  node.addEventListener('pointermove', onMove)
  return {
    destroy: () => {
      node.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    },
  }
}

const MAX_TILT = 6

/**
 * Pointer tilt for project hero screenshots (MOTION §4): the target rises 8px
 * and leans toward the pointer, clamped to ±6deg. The transform itself is in
 * the component's CSS, reading --rx/--ry/--lift, so the transition and the
 * resting state live in one place.
 */
export const tilt: Action<HTMLElement> = (node) => {
  if (!finePointer()) return

  let frame = 0

  const onMove = (event: PointerEvent) => {
    if (prefersReducedMotion.current) return
    const { clientX, clientY } = event
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect()
      const px = (clientX - rect.left) / rect.width - 0.5
      const py = (clientY - rect.top) / rect.height - 0.5
      const clamp = (v: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, v))
      node.style.setProperty('--rx', `${clamp(4 - py * 8)}deg`)
      node.style.setProperty('--ry', `${clamp(px * 12 - 6)}deg`)
      node.style.setProperty('--lift', '-8px')
    })
  }

  const onLeave = () => {
    cancelAnimationFrame(frame)
    node.style.removeProperty('--rx')
    node.style.removeProperty('--ry')
    node.style.removeProperty('--lift')
  }

  node.addEventListener('pointermove', onMove)
  node.addEventListener('pointerleave', onLeave)
  return {
    destroy: () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
    },
  }
}
