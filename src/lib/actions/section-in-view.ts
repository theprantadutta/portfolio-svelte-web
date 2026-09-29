import type { ActiveSectionState } from '$lib/context/active-section.svelte'
import type { ISectionName } from '$lib/types/section'

interface SectionInViewParams {
  state: ActiveSectionState
  section: ISectionName
}

interface TrackedSection {
  state: ActiveSectionState
  section: ISectionName
}

/**
 * How far down the viewport the "you are here" line sits. The active section is
 * the last one whose top has scrolled above it. Clicking a nav link parks the
 * section's top at its `scroll-mt-28` (112px), so the line has to sit below that
 * even on a short window; 35% of a 320px-tall landscape phone is still 112px.
 */
const PROBE_RATIO = 0.35

const tracked = new Map<Element, TrackedSection>()
let frame = 0

/*
  Position-based rather than the old per-section IntersectionObserver. Each
  section used to fire only when a zero-size marker at its top crossed into
  view, so landing in the middle of a tall section (a reload, a deep link, a
  fast scroll) or scrolling *up* into one left the previous section lit: the
  nav said Home over the project cards and Skills over the whole Experience
  timeline. Reading every tracked section's position against one line has no
  such blind spot, and it works on the content-visibility placeholders too.
*/
const update = () => {
  frame = 0

  const probe = window.innerHeight * PROBE_RATIO
  // The last section can be too short to ever reach the line, so the bottom of
  // the page always belongs to it.
  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2

  let current: TrackedSection | undefined
  let currentTop = -Infinity
  for (const [target, entry] of tracked) {
    const { top } = target.getBoundingClientRect()
    if ((atBottom || top <= probe) && top > currentTop) {
      current = entry
      currentTop = top
    }
  }

  // Ignore scrolling briefly after a nav click, so passing through
  // intermediate sections can't steal the highlight from the target.
  if (current && Date.now() - current.state.timeOfLastClick > 1000) {
    current.state.setActiveSection(current.section)
  }
}

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(update)
}

/*
  Sections also move without a scroll event: a content-visibility placeholder
  swapping for the real, often much taller, section above the viewport, or
  images loading. Watching their sizes keeps the highlight from going stale
  until the next scroll.
*/
let resizeObserver: ResizeObserver | undefined

/**
 * Registers the host's enclosing <section> as the nav target for `section`.
 *
 * `SectionMarker` applies this to a zero-size span inside the section; `Skills`
 * applies it to the <section> itself. Every tracked section shares one scroll
 * listener and one ResizeObserver.
 */
export const sectionInView = (
  node: HTMLElement,
  { state, section }: SectionInViewParams
) => {
  const target = node.closest('section') ?? node

  if (tracked.size === 0) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    resizeObserver = new ResizeObserver(schedule)
  }
  tracked.set(target, { state, section })
  resizeObserver?.observe(target)
  schedule()

  return {
    destroy() {
      tracked.delete(target)
      resizeObserver?.unobserve(target)
      if (tracked.size === 0) {
        window.removeEventListener('scroll', schedule)
        window.removeEventListener('resize', schedule)
        resizeObserver?.disconnect()
        resizeObserver = undefined
        cancelAnimationFrame(frame)
        frame = 0
      }
    },
  }
}
