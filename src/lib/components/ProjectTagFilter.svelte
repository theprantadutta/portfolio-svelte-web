<script lang="ts">
  import { goto } from '$app/navigation'

  /**
   * Tag filtering used to happen on the server: /projects read `searchParams`
   * and returned a filtered list, which made the page dynamic. On a prerendered
   * site the page is a single static file, so the filtering moved to the
   * client — the URL stays exactly as shareable as before, but selecting a tag
   * is now instant and costs no request at all.
   */
  interface Props {
    allTags: string[]
    selectedTags: string[]
  }

  let { allTags, selectedTags }: Props = $props()

  const isAllSelected = $derived(selectedTags.length === 0)

  const apply = (tags: string[]) => {
    const query = tags.length ? `?tags=${tags.join(',')}` : ''
    goto(`/projects${query}`, { noScroll: true, keepFocus: true })
  }

  const toggleTag = (tag: string) => {
    const tagLower = tag.toLowerCase()
    const current = selectedTags.map((t) => t.toLowerCase())

    apply(
      current.includes(tagLower)
        ? current.filter((t) => t !== tagLower)
        : [...current, tagLower]
    )
  }

  const clearAll = () => apply([])
</script>

<div class="mx-auto mb-10 flex max-w-4xl flex-wrap justify-center gap-2">
  <!-- All Button -->
  <button
    onclick={clearAll}
    class="special-border px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:scale-105 {isAllSelected
      ? 'from-primary-600 to-secondary-600 shadow-primary-500/25 bg-linear-to-r text-white shadow-lg'
      : 'glass-card bg-linear-to-r from-gray-500/10 to-gray-600/10 text-gray-700 hover:from-gray-500/20 hover:to-gray-600/20 dark:text-gray-300'}"
  >
    All
  </button>

  <!-- Tag Buttons -->
  {#each allTags as tag (tag)}
    {@const isActive = selectedTags.some(
      (t) => t.toLowerCase() === tag.toLowerCase()
    )}
    <button
      onclick={() => toggleTag(tag)}
      class="special-border px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:scale-105 {isActive
        ? 'from-primary-600 to-secondary-600 shadow-primary-500/25 bg-linear-to-r text-white shadow-lg'
        : 'glass-card bg-linear-to-r from-gray-500/10 to-gray-600/10 text-gray-700 hover:from-gray-500/20 hover:to-gray-600/20 dark:text-gray-300'}"
    >
      {tag}
    </button>
  {/each}
</div>
