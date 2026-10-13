/**
 * Shared motion vocabulary (MOTION.md §0). CSS owns the keyframes and the
 * easing tokens in app.css; this file is the JavaScript side of the same
 * numbers, for the handful of things CSS can't drive on its own: springs,
 * count-ups and anything that depends on where an element is.
 */
import { prefersReducedMotion } from 'svelte/motion'

export { prefersReducedMotion }

export const DURATION = {
  hover: 120,
  press: 200,
  lift: 320,
  reveal: 600,
  hero: 900,
} as const

/** Stagger between siblings, and the cap on how much of a list staggers. */
export const STAGGER = 50
export const STAGGER_LIMIT = 8

/** `{ stiffness: 420, damping: 32 }` for UI, in svelte/motion's terms. */
export const SPRING_UI = { stiffness: 0.32, damping: 0.62 }
/** `{ stiffness: 260, damping: 26 }` for cards. */
export const SPRING_CARD = { stiffness: 0.18, damping: 0.55 }

/**
 * A close fit to cubic-bezier(.22, 1, .36, 1), the entrance curve, for
 * JS-timed tweens. svelte/easing has no exact equivalent, and the difference
 * is invisible at these durations.
 */
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3.4)

/** True when the device can hover with a precise pointer (mouse, trackpad). */
export const finePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

/** True when an element starts below the visible part of the page. */
export const isBelowFold = (node: Element) =>
  node.getBoundingClientRect().top > window.innerHeight
