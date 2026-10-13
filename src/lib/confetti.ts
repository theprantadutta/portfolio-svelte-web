import { prefersReducedMotion } from '$lib/motion'

const COLORS = ['--green', '--blue', '--purple', '--orange', '--red']

/**
 * A short confetti burst from the middle of `host` (MOTION §4, contact
 * submit): at most 40 pieces in the accent colours, gone in 900ms. Plain
 * DOM and the Web Animations API, so there is nothing to load and nothing
 * left behind. Skipped entirely for reduced motion.
 */
export const confetti = (host: HTMLElement, count = 36) => {
  if (prefersReducedMotion.current) return

  const styles = getComputedStyle(document.documentElement)
  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  Object.assign(layer.style, {
    position: 'absolute',
    inset: '0',
    overflow: 'visible',
    pointerEvents: 'none',
    zIndex: '5',
  })
  host.appendChild(layer)

  const pieces = Array.from({ length: Math.min(count, 40) }, (_, i) => {
    const piece = document.createElement('span')
    const size = 5 + Math.random() * 5
    Object.assign(piece.style, {
      position: 'absolute',
      left: '50%',
      top: '38%',
      width: `${size}px`,
      height: `${size * (0.4 + Math.random() * 0.8)}px`,
      borderRadius: Math.random() > 0.6 ? '50%' : '2px',
      background: styles.getPropertyValue(COLORS[i % COLORS.length]),
    })
    layer.appendChild(piece)

    const angle = Math.random() * Math.PI * 2
    const distance = 90 + Math.random() * 160
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance * 0.7 - 60
    const spin = (Math.random() - 0.5) * 720

    return piece.animate(
      [
        {
          transform: 'translate(-50%, -50%) rotate(0deg) scale(1)',
          opacity: 1,
        },
        {
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y + 80}px)) rotate(${spin}deg) scale(0.8)`,
          opacity: 0,
        },
      ],
      { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }
    ).finished
  })

  Promise.allSettled(pieces).then(() => layer.remove())
}
