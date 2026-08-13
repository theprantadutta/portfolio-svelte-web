<script lang="ts">
  import DevToImage from '$components/DevToImage.svelte'
  import type { DevToArticleDetail } from '$lib/types/blog-types'
  import FiArrowLeft from '$icons/FiArrowLeft.svelte'
  import FiCalendar from '$icons/FiCalendar.svelte'
  import FiClock from '$icons/FiClock.svelte'
  import FiExternalLink from '$icons/FiExternalLink.svelte'
  import FiHeart from '$icons/FiHeart.svelte'
  import FiMessageCircle from '$icons/FiMessageCircle.svelte'

  let { article }: { article: DevToArticleDetail } = $props()
</script>

<div class="relative min-h-screen">
  <!-- Background Gradients -->
  <div class="fixed inset-0 -z-10">
    <div
      class="from-primary-500/20 to-secondary-600/20 absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-linear-to-br blur-3xl"
    ></div>
    <div
      class="from-accent-500/20 absolute right-1/4 bottom-1/4 h-80 w-80 animate-pulse rounded-full bg-linear-to-br to-orange-500/20 blur-3xl"
      style="animation-delay: 2s"
    ></div>
    <div
      class="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-linear-to-br from-green-500/15 to-teal-500/15 blur-3xl"
      style="animation-delay: 4s"
    ></div>
  </div>

  <!-- Back Button -->
  <div class="fixed top-4 left-4 z-50">
    <a
      href="/blogs"
      class="special-border glass-card group flex items-center gap-2 px-4 py-2 transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-800/40"
    >
      <FiArrowLeft
        class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
      />
      <span class="text-sm font-medium">Back to Blogs</span>
    </a>
  </div>

  <!-- Hero Section -->
  <section
    class="animate-fade-in-up relative px-4 pt-10 pb-8 sm:px-6 sm:pt-16 lg:px-8"
    style="--animation-delay: 100ms"
  >
    <div class="mx-auto max-w-4xl">
      <!-- Cover Image — match dev.to's 1000:420 canonical cover ratio so the
           uploaded artwork shows in full without crop or pillarboxing. -->
      {#if article.cover_image}
        <div
          class="special-border relative mb-8 aspect-[1000/420] overflow-hidden"
        >
          <DevToImage
            src={article.cover_image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
            class="object-cover"
          />
        </div>
      {/if}

      <!-- Title -->
      <h1
        class="mb-6 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-3xl leading-tight font-bold text-transparent sm:text-4xl md:text-5xl dark:from-white dark:via-gray-100 dark:to-white"
      >
        {article.title}
      </h1>

      <!-- Meta Row -->
      <div
        class="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400"
      >
        <span class="flex items-center gap-1.5">
          <FiCalendar class="h-4 w-4" />
          {article.readable_publish_date}
        </span>
        <span class="flex items-center gap-1.5">
          <FiClock class="h-4 w-4" />
          {article.reading_time_minutes} min read
        </span>
        <span class="flex items-center gap-1.5">
          <FiHeart class="h-4 w-4 text-red-500" />
          {article.public_reactions_count} reactions
        </span>
        <span class="flex items-center gap-1.5">
          <FiMessageCircle class="h-4 w-4 text-blue-500" />
          {article.comments_count} comments
        </span>
      </div>

      <!-- Tags -->
      <div class="mb-8 flex flex-wrap gap-2">
        {#each article.tag_list as tag (tag)}
          <span
            class="special-border glass-card bg-linear-to-r from-gray-500/10 to-gray-600/10 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            {tag}
          </span>
        {/each}
      </div>
    </div>
  </section>

  <!-- Article Body -->
  <section
    class="animate-fade-in-up px-4 pb-16 sm:px-6 lg:px-8"
    style="--animation-delay: 300ms"
  >
    <div class="mx-auto max-w-4xl">
      <div
        class="special-border glass-card overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xs dark:border-gray-700/30 dark:bg-gray-900/20"
      >
        <div
          class="prose prose-lg prose-gray dark:prose-invert max-w-none p-6 sm:p-8 md:p-10"
        >
          <!-- dev.to's own rendered HTML, same as the React version passed to
               dangerouslySetInnerHTML. -->
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html article.body_html}
        </div>
      </div>

      <!-- Footer - Read on dev.to -->
      <div
        class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
      >
        <div
          class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400"
        >
          <span class="flex items-center gap-1.5">
            <FiHeart class="h-4 w-4 text-red-500" />
            {article.public_reactions_count} reactions
          </span>
          <span class="flex items-center gap-1.5">
            <FiMessageCircle class="h-4 w-4 text-blue-500" />
            {article.comments_count} comments
          </span>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary special-border group inline-flex items-center gap-2 px-6 py-3 font-medium"
        >
          <span>Read on dev.to</span>
          <FiExternalLink
            class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          />
        </a>
      </div>
    </div>
  </section>
</div>
