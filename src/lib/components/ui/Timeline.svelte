<script lang="ts">
  import type { TimelineItemData } from '$lib/types/timeline'

  interface Props {
    items?: TimelineItemData[]
    animate?: boolean
  }

  let { items = [], animate = true }: Props = $props()
</script>

<div class="mx-auto max-w-3xl py-8">
  <div class="space-y-10 sm:space-y-12">
    {#each items as item, index (index)}
      {@const isLast = index === items.length - 1}
      {@const Icon = item.icon}
      <div class="group relative flex items-start {animate ? 'reveal' : ''}">
        <!-- Timeline line -->
        {#if !isLast}
          <div
            class="group-hover:from-primary-400 group-hover:to-secondary-400 absolute top-12 left-4 h-full w-0.5 bg-linear-to-b from-gray-300 to-gray-200 transition-all duration-500 dark:from-gray-600 dark:to-gray-700"
          ></div>
        {/if}

        <!-- Icon container -->
        <div class="relative z-10 shrink-0">
          <div
            class="from-primary-500 to-secondary-600 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
          >
            {#if Icon}
              <Icon class="h-4 w-4 text-white" />
            {:else}
              <div class="h-3 w-3 rounded-full bg-white"></div>
            {/if}
          </div>

          <!-- Glow effect -->
          <div
            class="from-primary-500 to-secondary-600 absolute inset-0 h-8 w-8 rounded-full bg-linear-to-br opacity-0 transition-all duration-500 group-hover:scale-150 group-hover:opacity-20"
          ></div>
        </div>

        <!-- Content -->
        <div class="ml-6 min-w-0 flex-1">
          <!-- Date badge -->
          <div
            class="special-border from-primary-100 to-secondary-100 text-primary-800 dark:from-primary-900/30 dark:to-secondary-900/30 dark:text-primary-300 mb-3 inline-flex items-center bg-linear-to-r px-3 py-1 text-xs font-medium"
          >
            {item.date}
          </div>

          <!-- Content card -->
          <div
            class="special-border glass-card relative mx-auto max-w-4xl overflow-hidden border border-white/10 bg-white/5 p-6 backdrop-blur-xs transition-all duration-500 hover:-translate-y-3 hover:bg-white/10 hover:shadow-2xl dark:border-gray-700/30 dark:bg-gray-900/20 dark:hover:bg-gray-900/30"
          >
            <!-- Enhanced gradient overlay -->
            <div
              class="from-primary-500/10 via-secondary-500/10 to-accent-500/10 absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            ></div>

            <h3
              class="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {item.title}
            </h3>

            {#if item.location}
              <p
                class="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {item.location}
              </p>
            {/if}

            <p class="leading-relaxed text-gray-700 dark:text-gray-300">
              {item.description}
            </p>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
