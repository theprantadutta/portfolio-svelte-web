/**
 * Shares one promise per key for `ttlMs`.
 *
 * Prerendering runs every page's load in one process, and most pages need the
 * same few lists (all projects, all articles). Without this, a build made the
 * same Strapi and dev.to requests once per page, and dev.to's rate limit
 * turned that into minutes of waiting. A rejected promise is dropped at once
 * so the next caller retries instead of inheriting the failure.
 */
export const createMemo = (ttlMs: number) => {
  const cache = new Map<string, { at: number; value: Promise<unknown> }>()

  return <T>(key: string, load: () => Promise<T>): Promise<T> => {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.at < ttlMs) return hit.value as Promise<T>

    const value = load()
    cache.set(key, { at: Date.now(), value })
    value.catch(() => {
      if (cache.get(key)?.value === value) cache.delete(key)
    })
    return value
  }
}
