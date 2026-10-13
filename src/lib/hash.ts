/**
 * A 7-character hex "commit hash" for anything with a stable string, such as
 * a commit message or a blog slug.
 *
 * Purely decorative, so FNV-1a is plenty: deterministic across builds and
 * runtimes, and well spread for short strings. Not a git SHA, and never
 * presented as one in anything machine-readable.
 */
export const shortHash = (input: string) => {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  // Fold a second round in so the 7th hex digit isn't always low-entropy.
  const mixed = (hash ^ (hash >>> 15)) >>> 0
  return (
    mixed.toString(16).padStart(8, '0') + (hash >>> 0).toString(16)
  ).slice(0, 7)
}
