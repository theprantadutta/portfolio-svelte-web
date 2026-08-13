<script lang="ts">
  import ProjectModal from '$components/ProjectModal.svelte'
  import StrapiImage from '$components/StrapiImage.svelte'
  import { getPlatformBadgeInfo, getStatusBadgeInfo } from '$lib/project-utils'
  import type { ProjectDataAttributes } from '$lib/types/types'
  import FaCloud from '$icons/FaCloud.svelte'
  import FaCode from '$icons/FaCode.svelte'
  import FaDesktop from '$icons/FaDesktop.svelte'
  import FaExternalLinkAlt from '$icons/FaExternalLinkAlt.svelte'
  import FaMobile from '$icons/FaMobile.svelte'
  import FaStar from '$icons/FaStar.svelte'

  let { project }: { project: ProjectDataAttributes } = $props()

  const platformBadge = $derived(getPlatformBadgeInfo(project.platformType))
  const statusBadge = $derived(getStatusBadgeInfo(project.projectStatus))

  // Platform icon based on platformType from Strapi
  const ProjectIcon = $derived.by(() => {
    switch (project.platformType) {
      case 'android':
      case 'ios':
      case 'android-and-ios':
        return FaMobile
      case 'web':
        return FaDesktop
      case 'cloud':
        return FaCloud
      default:
        return FaCode
    }
  })
</script>

<div class="reveal group mb-10">
  <div
    class="special-border glass-card relative mx-auto max-w-4xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xs transition-all duration-500 hover:-translate-y-3 hover:bg-white/10 hover:shadow-2xl dark:border-gray-700/30 dark:bg-gray-900/20 dark:hover:bg-gray-900/30"
  >
    <!-- Enhanced gradient overlay -->
    <div
      class="from-primary-500/10 via-secondary-500/10 to-accent-500/10 absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    ></div>

    <!-- Content Layout -->
    <div class="grid gap-6 p-6 md:grid-cols-2">
      <!-- Left Column - Text Content -->
      <div class="relative z-10 flex flex-col justify-between space-y-4">
        <!-- Header with Platform and Status Badges -->
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <!-- Platform Badge -->
          <div
            class="special-border glass-card flex items-center gap-2 bg-linear-to-r {platformBadge?.color ||
              'from-primary-500/20 to-secondary-500/20'} px-3 py-1"
          >
            <ProjectIcon class="h-4 w-4" />
            <span
              class="text-xs font-medium {platformBadge?.textColor ||
                'text-primary-600 dark:text-primary-400'}"
            >
              {platformBadge?.label || 'Project'}
            </span>
          </div>

          <!-- Status Badge -->
          <div
            class="special-border glass-card bg-linear-to-r {statusBadge?.color ||
              'from-gray-500/20 to-gray-600/20'} px-3 py-1"
          >
            <span
              class="text-xs font-medium {statusBadge?.textColor ||
                'text-gray-600 dark:text-gray-400'}"
            >
              {statusBadge?.label || 'Unknown'}
            </span>
          </div>

          <!-- Featured Star -->
          {#if project.isFeatured}
            <div
              class="special-border glass-card flex items-center gap-1 bg-linear-to-r from-yellow-500/20 to-orange-500/20 px-2 py-1"
            >
              <FaStar class="h-3 w-3 text-yellow-500" />
              <span
                class="text-xs font-medium text-yellow-600 dark:text-yellow-400"
              >
                Featured
              </span>
            </div>
          {/if}
        </div>

        <!-- Project Title -->
        <h3
          class="bg-linear-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-xl leading-tight font-bold text-transparent md:text-2xl dark:from-white dark:via-gray-200 dark:to-white"
        >
          {project.title}
        </h3>

        <!-- Project Description -->
        <p
          class="text-sm leading-relaxed text-gray-600 md:text-base dark:text-gray-300"
        >
          {project.description.length > 110
            ? `${project.description.substring(0, 110)}...`
            : project.description}
        </p>

        <!-- Technology Tags -->
        <div class="flex flex-wrap gap-2">
          {#each project.Tags.slice(0, 3) as tag, index (index)}
            <span
              class="special-border glass-card bg-linear-to-r from-gray-500/10 to-gray-600/10 px-3 py-1 text-xs font-medium text-gray-700 transition-transform duration-200 hover:scale-105 dark:text-gray-300"
            >
              {tag.name}
            </span>
          {/each}
          {#if project.Tags.length > 3}
            <span
              class="special-border glass-card bg-linear-to-r from-orange-500/10 to-red-500/10 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400"
            >
              +{project.Tags.length - 3}
            </span>
          {/if}
        </div>

        <!-- Action Buttons -->
        <ProjectModal imageUrls={project.imageUrls} slug={project.slug} />
      </div>

      <!-- Right Column - Project Image -->
      <a href="/projects/{project.slug}" class="group/image relative block">
        <div
          class="special-border relative aspect-4/3 overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
        >
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-10">
            <div
              class="from-primary-500/20 to-secondary-500/20 absolute inset-0 scale-150 rotate-12 transform bg-linear-to-r"
            ></div>
          </div>

          <!-- Main Project Image -->
          <div class="relative flex h-full items-center justify-center p-4">
            <div
              class="special-border relative aspect-9/16 w-full max-w-[170px] transform overflow-hidden bg-white shadow-xl transition-all duration-500 group-hover/image:scale-105 group-hover/image:rotate-2 dark:bg-gray-900"
            >
              <StrapiImage
                src={project.cover.formats.medium?.url ||
                  project.cover.formats.large.url}
                formats={project.cover.formats}
                alt="{project.title} project preview"
                width={170}
                height={300}
                fill
                sizes="(max-width: 768px) 100vw, 170px"
                objectFit="cover"
                class="object-cover"
              />

              <!-- Image overlay -->
              <div
                class="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/image:opacity-100"
              ></div>
            </div>
          </div>

          <!-- Decorative Elements -->
          <div
            class="bg-primary-500 absolute top-3 right-3 h-2 w-2 animate-ping rounded-full"
          ></div>
          <div
            class="bg-secondary-500 absolute bottom-3 left-3 h-2 w-2 animate-pulse rounded-full"
          ></div>

          <!-- Screenshot Count Badge -->
          <div
            class="special-border glass-card absolute top-3 left-3 bg-black/20 px-2 py-1 backdrop-blur-xs"
          >
            <span class="text-xs font-medium text-white">
              {project.imageUrls.length}
            </span>
          </div>
        </div>

        <!-- Hover Info -->
        <div
          class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/image:opacity-100"
        >
          <div
            class="special-border glass-card bg-white/90 px-3 py-2 backdrop-blur-xs dark:bg-gray-900/90"
          >
            <div class="flex items-center gap-2 text-sm font-medium">
              <FaExternalLinkAlt class="h-3 w-3" />
              <span>View Project</span>
            </div>
          </div>
        </div>
      </a>
    </div>

    <!-- Bottom Stats Bar -->
    <div
      class="border-t border-white/10 bg-white/5 px-5 py-3 dark:border-gray-700/30 dark:bg-gray-900/20"
    >
      <div
        class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400"
      >
        <div class="flex items-center gap-4">
          <!-- Complexity Indicator -->
          <span class="flex items-center gap-1.5">
            <span>Complexity</span>
            <div class="flex items-center gap-0.5">
              {#each Array(5) as _, i (i)}
                <div
                  class="h-1.5 w-1.5 rounded-full {i < project.complexity
                    ? 'bg-primary-500'
                    : 'bg-gray-300 dark:bg-gray-600'}"
                ></div>
              {/each}
            </div>
          </span>
          <span>{project.Tags.length} Tech</span>
        </div>
        <span>{project.imageUrls.length} Screens</span>
      </div>
    </div>
  </div>
</div>
