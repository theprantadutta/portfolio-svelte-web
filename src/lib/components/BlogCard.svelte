<script lang="ts">
  import DevToImage from '$components/DevToImage.svelte'
  import type { DevToArticle } from '$lib/types/blog-types'
  import FiCalendar from '$icons/FiCalendar.svelte'
  import FiClock from '$icons/FiClock.svelte'
  import FiHeart from '$icons/FiHeart.svelte'
  import FiMessageCircle from '$icons/FiMessageCircle.svelte'

  let { article }: { article: DevToArticle } = $props()
</script>

<div class="reveal h-full">
  <!-- The whole card is one anchor: it was a div with an onClick, which no
       keyboard user could reach and no crawler could follow. -->
  <a
    href="/blogs/{article.slug}"
    class="special-border glass-card group relative flex h-full flex-col overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xs transition-all duration-500 hover:-translate-y-3 hover:bg-white/10 hover:shadow-2xl dark:border-gray-700/30 dark:bg-gray-900/20 dark:hover:bg-gray-900/30"
  >
    <!-- Gradient overlay on hover -->
    <div
      class="from-primary-500/10 via-secondary-500/10 to-accent-500/10 absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    ></div>

    <!-- Cover Image — dev.to standard cover ratio is 1000:420; matching the
         container avoids the cover/cropping mismatch we'd see with aspect-video. -->
    <div
      class="relative aspect-[1000/420] shrink-0 overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
    >
      {#if article.cover_image}
        <DevToImage
          src={article.cover_image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          class="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      {:else}
        <div
          class="from-primary-500/20 via-secondary-500/20 to-accent-500/20 flex h-full items-center justify-center bg-linear-to-br"
        >
          <!-- Fallback icon for missing cover images -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-12 w-12 text-gray-400 dark:text-gray-600"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.472.89 6.077 2.35m0-14.308A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.472.89-6.077 2.35"
            />
          </svg>
        </div>
      {/if}

      <!-- Reading time badge -->
      <div
        class="special-border glass-card absolute top-3 right-3 bg-black/30 px-2.5 py-1 backdrop-blur-xs"
      >
        <span class="flex items-center gap-1 text-xs font-medium text-white">
          <FiClock class="h-3 w-3" />
          {article.reading_time_minutes} min
        </span>
      </div>
    </div>

    <!-- Content - grows to fill available space -->
    <div class="relative z-10 flex flex-1 flex-col space-y-3 p-5">
      <!-- Title - reserves 2 lines so cards line up.
           min-h must stay BELOW the clamped height (2 x 22.5px = 45px here),
           never above it: line-clamp hides the overflow at the box edge, so a
           taller box just exposes a sliver of the third line under the ellipsis. -->
      <h3
        class="line-clamp-2 min-h-[2.75rem] bg-linear-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-lg leading-tight font-bold text-transparent dark:from-white dark:via-gray-200 dark:to-white"
      >
        {article.title}
      </h3>

      <!-- Description - fixed 2-line height -->
      <p
        class="line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-gray-600 dark:text-gray-300"
      >
        {article.description}
      </p>

      <!-- Tags - pushed to bottom of content area -->
      <div class="mt-auto flex flex-wrap gap-2">
        {#each article.tag_list.slice(0, 3) as tag (tag)}
          <span
            class="special-border glass-card bg-linear-to-r from-gray-500/10 to-gray-600/10 px-3 py-1 text-xs font-medium text-gray-700 transition-transform duration-200 hover:scale-105 dark:text-gray-300"
          >
            {tag}
          </span>
        {/each}
        {#if article.tag_list.length > 3}
          <span
            class="special-border glass-card bg-linear-to-r from-orange-500/10 to-red-500/10 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400"
          >
            +{article.tag_list.length - 3}
          </span>
        {/if}
      </div>
    </div>

    <!-- Bottom Stats Bar - always pinned to bottom -->
    <div
      class="shrink-0 border-t border-white/10 bg-white/5 px-5 py-3 dark:border-gray-700/30 dark:bg-gray-900/20"
    >
      <div
        class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400"
      >
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5">
            <FiHeart class="h-3.5 w-3.5 text-red-500" />
            {article.public_reactions_count}
          </span>
          <span class="flex items-center gap-1.5">
            <FiMessageCircle class="h-3.5 w-3.5 text-blue-500" />
            {article.comments_count}
          </span>
        </div>
        <span class="flex items-center gap-1.5">
          <FiCalendar class="h-3.5 w-3.5" />
          {article.readable_publish_date}
        </span>
      </div>
    </div>
  </a>
</div>
