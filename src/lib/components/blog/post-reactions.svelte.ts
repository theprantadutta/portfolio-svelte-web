import {
  emptyReactionCounts,
  REACTIONS,
  type ReactionCounts,
  type ReactionEmoji,
} from '$lib/reactions'
import { toast } from '$lib/toast.svelte'

const storageKey = (slug: string) => `reactions:${slug}`

/**
 * One post's reactions, shared by the desktop card and the mobile floating
 * bar so both always agree.
 *
 * Counts come from the CMS: the prerendered page carries the build's numbers
 * and `refresh()` swaps in current ones. Which reactions this visitor has
 * given lives in their localStorage, since there are no accounts. Toggling is
 * optimistic: the number moves at once, the request follows, and a failure
 * puts both back and says so.
 */
export class PostReactions {
  counts = $state<ReactionCounts>(emptyReactionCounts())
  mine = $state<Record<ReactionEmoji, boolean>>({
    heart: false,
    fire: false,
    rocket: false,
    eyes: false,
  })
  /** Emojis with a request in flight, which ignore further taps meanwhile. */
  pending = $state<Partial<Record<ReactionEmoji, boolean>>>({})

  readonly slug: string

  constructor(slug: string, initial: ReactionCounts) {
    this.slug = slug
    this.counts = { ...initial }
  }

  /** Reads the visitor's own reactions and fetches current counts. */
  hydrate = async () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(storageKey(this.slug)) ?? '[]'
      )
      if (Array.isArray(saved)) {
        for (const reaction of REACTIONS) {
          this.mine[reaction.id] = saved.includes(reaction.id)
        }
      }
    } catch {
      // Storage unavailable or corrupt: start with nothing selected.
    }

    try {
      const response = await fetch(`/api/reactions/${this.slug}`)
      if (!response.ok) return
      const body = (await response.json()) as { counts?: ReactionCounts }
      if (body.counts)
        this.counts = { ...emptyReactionCounts(), ...body.counts }
    } catch {
      // The build's counts are already on screen.
    }
  }

  #save() {
    try {
      const picked = REACTIONS.map((r) => r.id).filter((id) => this.mine[id])
      localStorage.setItem(storageKey(this.slug), JSON.stringify(picked))
    } catch {
      // Private mode: the reaction still counts, it just won't be remembered.
    }
  }

  /** Returns true when the reaction was added (the caller celebrates). */
  toggle = (emoji: ReactionEmoji): boolean => {
    if (this.pending[emoji]) return false

    const adding = !this.mine[emoji]
    const delta = adding ? 1 : -1
    const before = { counts: { ...this.counts }, mine: this.mine[emoji] }

    this.mine[emoji] = adding
    this.counts[emoji] = Math.max(0, this.counts[emoji] + delta)
    this.pending[emoji] = true
    this.#save()

    fetch(`/api/reactions/${this.slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji, delta }),
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as {
          counts?: ReactionCounts
          error?: string
        }
        if (!response.ok || !body.counts) {
          throw new Error(body.error ?? `HTTP ${response.status}`)
        }
        this.counts = { ...emptyReactionCounts(), ...body.counts }
      })
      .catch(() => {
        this.counts = before.counts
        this.mine[emoji] = before.mine
        this.#save()
        toast.error("Couldn't save that reaction. Try again in a moment.")
      })
      .finally(() => {
        this.pending[emoji] = false
      })

    return adding
  }
}
