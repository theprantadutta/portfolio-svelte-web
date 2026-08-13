<script lang="ts">
  import { page } from '$app/state'

  // Replaces Next's not-found.tsx. SvelteKit renders this for any error status,
  // and the prerenderer writes it out as build/prerendered/.../404.html, which
  // is what a static host serves for unknown paths.
  const is404 = $derived(page.status === 404)
  const title = $derived(
    is404
      ? '404 - Page Not Found | Pranta Dutta'
      : `${page.status} - Something went wrong | Pranta Dutta`
  )
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main
  class="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-gray-50 px-4 dark:bg-gray-900"
>
  <!-- Background Gradient Blobs -->
  <div class="fixed inset-0 -z-10">
    <div
      class="from-primary-500/20 to-secondary-600/20 absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-linear-to-br blur-3xl"
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

  <!-- Content -->
  <div class="animate-fade-in-up relative text-center">
    <!-- Glass Card -->
    <div
      class="special-border glass-card relative overflow-hidden border border-white/10 px-6 py-8 sm:px-16 sm:py-16 dark:border-gray-700/30"
    >
      <!-- Gradient overlay -->
      <div
        class="from-primary-500/5 via-secondary-500/5 to-accent-500/5 absolute inset-0 bg-linear-to-br"
      ></div>

      <!-- Decorative dots -->
      <div
        class="bg-primary-500 absolute top-6 right-6 h-2 w-2 animate-ping rounded-full"
      ></div>
      <div
        class="bg-secondary-500 absolute bottom-6 left-6 h-2 w-2 animate-pulse rounded-full"
      ></div>
      <div
        class="bg-accent-500 absolute top-6 left-6 h-1.5 w-1.5 animate-pulse rounded-full"
        style="animation-delay: 1s"
      ></div>

      <div class="relative">
        <!-- Status Number -->
        <h1
          class="from-primary-500 to-secondary-500 animate-float mb-4 bg-linear-to-r bg-clip-text font-serif text-7xl font-bold text-transparent sm:text-9xl"
        >
          {page.status}
        </h1>

        <!-- Heading -->
        <h2
          class="mb-4 bg-linear-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl dark:from-white dark:via-gray-200 dark:to-white"
        >
          {is404 ? 'Page Not Found' : 'Something Went Wrong'}
        </h2>

        <!-- Description -->
        <p
          class="mx-auto mb-8 max-w-md text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400"
        >
          {#if is404}
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          {:else}
            {page.error?.message ?? 'An unexpected error occurred.'} Let's get you
            back on track.
          {/if}
        </p>

        <!-- CTA Buttons -->
        <div
          class="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <a
            href="/"
            class="btn-primary special-border group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium sm:px-6 sm:py-3 sm:text-base"
          >
            <svg
              class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <span>Go Home</span>
          </a>

          <a
            href="/projects"
            class="btn-secondary special-border group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium sm:px-6 sm:py-3 sm:text-base"
          >
            <span>View Projects</span>
            <svg
              class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </a>

          <a
            href="/blogs"
            class="btn-secondary special-border group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium sm:px-6 sm:py-3 sm:text-base"
          >
            <span>View Blogs</span>
            <svg
              class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.331 0 4.472.89 6.077 2.35m0-14.308a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-5.923 2.35"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</main>
