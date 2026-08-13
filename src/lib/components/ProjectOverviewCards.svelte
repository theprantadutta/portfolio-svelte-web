<script lang="ts">
  import {
    getDeveloperRoleInfo,
    getPlatformBadgeInfo,
    getStatusBadgeInfo,
    type ProjectAnalysis,
  } from '$lib/project-utils'
  import type { ProjectDataAttributes } from '$lib/types/types'
  import FaAppStoreIos from '$icons/FaAppStoreIos.svelte'
  import FaCalendarAlt from '$icons/FaCalendarAlt.svelte'
  import FaCheckCircle from '$icons/FaCheckCircle.svelte'
  import FaCode from '$icons/FaCode.svelte'
  import FaGithub from '$icons/FaGithub.svelte'
  import FaGlobe from '$icons/FaGlobe.svelte'
  import FaGooglePlay from '$icons/FaGooglePlay.svelte'
  import FaImage from '$icons/FaImage.svelte'
  import FaMobile from '$icons/FaMobile.svelte'
  import FaStar from '$icons/FaStar.svelte'
  import FaUserCog from '$icons/FaUserCog.svelte'

  interface Props {
    project: ProjectDataAttributes
    analysis: ProjectAnalysis
  }

  let { project, analysis }: Props = $props()

  const platformBadge = $derived(getPlatformBadgeInfo(project.platformType))
  const statusBadge = $derived(getStatusBadgeInfo(project.projectStatus))
  const developerRole = $derived(getDeveloperRoleInfo(project.developerRole))

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })

  const metrics = $derived([
    {
      label: 'Completeness',
      value: `${analysis.projectInsights.completeness}%`,
      icon: FaCheckCircle,
    },
    {
      label: 'Visual Assets',
      value: analysis.projectInsights.visualRichness,
      icon: FaImage,
    },
    { label: 'Technologies', value: project.Tags?.length || 0, icon: FaCode },
    {
      label: 'Platform Reach',
      value: analysis.projectInsights.platformReach,
      icon: FaGlobe,
    },
  ])
</script>

<div class="mb-12 grid gap-6 md:grid-cols-3">
  <!-- Key Metrics Card -->
  <div
    class="special-border glass-card from-primary-500/5 to-secondary-500/5 bg-linear-to-br p-6"
  >
    <div class="mb-4 flex items-center gap-3">
      <div
        class="special-border glass-card from-primary-500/20 to-secondary-500/20 bg-linear-to-r p-2"
      >
        <FaCheckCircle class="text-primary-600 dark:text-primary-400 h-5 w-5" />
      </div>
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
        Project Metrics
      </h3>
    </div>

    <div class="space-y-3">
      {#each metrics as metric (metric.label)}
        {@const MetricIcon = metric.icon}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="text-gray-500 dark:text-gray-400">
              <MetricIcon class="h-4 w-4" />
            </div>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {metric.label}
            </span>
          </div>
          <span class="font-medium text-gray-900 dark:text-white">
            {metric.value}
          </span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Platform & Availability Card -->
  <div
    class="special-border glass-card bg-linear-to-br from-green-500/5 to-teal-500/5 p-6"
  >
    <div class="mb-4 flex items-center gap-3">
      <div
        class="special-border glass-card bg-linear-to-r from-green-500/20 to-teal-500/20 p-2"
      >
        <FaMobile class="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
        Platform Info
      </h3>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-gray-600 dark:text-gray-400">Type</span>
        <span
          class="font-medium {platformBadge?.textColor ||
            'text-gray-900 dark:text-white'}"
        >
          {platformBadge?.label}
        </span>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-gray-600 dark:text-gray-400">Status</span>
        <span
          class="font-medium {statusBadge?.textColor ||
            'text-gray-900 dark:text-white'}"
        >
          {statusBadge?.label}
        </span>
      </div>

      <div class="space-y-2">
        {#if project.githubLink}
          <div class="flex items-center gap-2 text-sm">
            <FaGithub class="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span class="text-green-600 dark:text-green-400">
              Source Available
            </span>
          </div>
        {/if}

        {#if project.googlePlayLink}
          <div class="flex items-center gap-2 text-sm">
            <FaGooglePlay class="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span class="text-green-600 dark:text-green-400">Google Play</span>
          </div>
        {/if}

        {#if project.appStoreLink}
          <div class="flex items-center gap-2 text-sm">
            <FaAppStoreIos class="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span class="text-green-600 dark:text-green-400">App Store</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Featured Status & Highlights Card -->
  <div
    class="special-border glass-card to-accent-500/5 bg-linear-to-br from-orange-500/5 p-6"
  >
    <div class="mb-4 flex items-center gap-3">
      <div
        class="special-border glass-card to-accent-500/20 bg-linear-to-r from-orange-500/20 p-2"
      >
        <FaStar class="h-5 w-5 text-orange-600 dark:text-orange-400" />
      </div>
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
        Project Details
      </h3>
    </div>

    <div class="space-y-4">
      {#if project.isFeatured}
        <div
          class="special-border glass-card bg-linear-to-r from-yellow-500/10 to-orange-500/10 p-3 text-center"
        >
          <div class="flex items-center justify-center gap-2">
            <FaStar class="h-4 w-4 text-yellow-500" />
            <span class="font-medium text-yellow-700 dark:text-yellow-400">
              Featured Project
            </span>
          </div>
        </div>
      {/if}

      <div class="space-y-2">
        <!-- Technical Complexity - real data from Strapi -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Complexity</span>
          <div class="flex items-center gap-1">
            {#each Array(5) as _, i (i)}
              <div
                class="h-2 w-2 rounded-full {i < project.complexity
                  ? 'bg-primary-500'
                  : 'bg-gray-300 dark:bg-gray-600'}"
              ></div>
            {/each}
          </div>
        </div>

        <!-- Developer Role -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Role</span>
          <div class="flex items-center gap-2">
            <FaUserCog class="h-3 w-3 text-gray-500" />
            <span class="font-medium text-gray-900 dark:text-white">
              {developerRole}
            </span>
          </div>
        </div>

        <!-- Timeline -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Timeline</span>
          <div class="flex items-center gap-2">
            <FaCalendarAlt class="h-3 w-3 text-gray-500" />
            <span class="font-medium text-gray-900 dark:text-white">
              {formatDate(project.startDate)}{project.endDate
                ? ` - ${formatDate(project.endDate)}`
                : ' - Present'}
            </span>
          </div>
        </div>

        {#if analysis.contentQuality.hasDetailedDescription}
          <div class="flex items-center gap-2 text-sm">
            <div class="h-2 w-2 rounded-full bg-green-500"></div>
            <span class="text-green-600 dark:text-green-400">
              Rich Content Available
            </span>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
