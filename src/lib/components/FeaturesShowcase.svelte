<script lang="ts">
  import { getProjectFeatures } from '$lib/project-utils'
  import type { ProjectDataAttributes } from '$lib/types/types'

  let { project }: { project: ProjectDataAttributes } = $props()

  const features = $derived(getProjectFeatures(project.features || []))

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      design: 'from-secondary-500/20 to-accent-500/20',
      performance: 'from-green-500/20 to-teal-500/20',
      development: 'from-primary-500/20 to-primary-500/20',
      security: 'from-red-500/20 to-orange-500/20',
      compatibility: 'from-yellow-500/20 to-orange-500/20',
      deployment: 'from-primary-500/20 to-primary-500/20',
      documentation: 'from-primary-500/20 to-secondary-500/20',
    }
    return colors[category] || 'from-gray-500/20 to-gray-600/20'
  }
</script>

{#if features.length > 0}
  <div class="space-y-16">
    <!-- Features Grid -->
    <section>
      <div class="mb-8 text-center">
        <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Key Features
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          What makes this project special
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each features as feature, index (index)}
          {@const FeatureIcon = feature.icon}
          <div
            class="special-border glass-card bg-linear-to-br {getCategoryColor(
              feature.category
            )} p-6 transition-all duration-300 hover:scale-[1.02]"
            style="animation-delay: {index * 100}ms"
          >
            <div class="mb-4 flex items-center gap-3">
              <div
                class="special-border glass-card flex items-center justify-center bg-linear-to-r {getCategoryColor(
                  feature.category
                )} p-2 text-gray-700 dark:text-gray-300"
              >
                <FeatureIcon class="h-6 w-6" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
            </div>
            <p class="leading-relaxed text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
            <div class="mt-3">
              <span
                class="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-500"
              >
                {feature.category}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
{/if}
