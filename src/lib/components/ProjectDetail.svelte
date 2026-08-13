<script lang="ts">
  import EnhancedGallery from '$components/EnhancedGallery.svelte'
  import FeaturesShowcase from '$components/FeaturesShowcase.svelte'
  import ProjectOverviewCards from '$components/ProjectOverviewCards.svelte'
  import StrapiBlocks from '$components/StrapiBlocks.svelte'
  import {
    analyzeProject,
    getDeveloperRoleInfo,
    getPlatformBadgeInfo,
    getStatusBadgeInfo,
  } from '$lib/project-utils'
  import type { ProjectDataAttributes } from '$lib/types/types'
  import FaAppStoreIos from '$icons/FaAppStoreIos.svelte'
  import FaArrowLeft from '$icons/FaArrowLeft.svelte'
  import FaCode from '$icons/FaCode.svelte'
  import FaExternalLinkAlt from '$icons/FaExternalLinkAlt.svelte'
  import FaGithub from '$icons/FaGithub.svelte'
  import FaGooglePlay from '$icons/FaGooglePlay.svelte'
  import FaHeart from '$icons/FaHeart.svelte'
  import FaMobile from '$icons/FaMobile.svelte'
  import FaStar from '$icons/FaStar.svelte'

  let { project }: { project: ProjectDataAttributes } = $props()

  let selectedImageIndex = $state(0)

  const analysis = $derived(analyzeProject(project))
  const platformBadge = $derived(getPlatformBadgeInfo(project.platformType))
  const statusBadge = $derived(getStatusBadgeInfo(project.projectStatus))
  const developerRole = $derived(getDeveloperRoleInfo(project.developerRole))

  // Flutter is highlighted as the preferred technology, per the original.
  const enhancedTags = $derived(
    (project.Tags ?? []).map((tag) => ({
      ...tag,
      isFavorite: tag.name.toLowerCase().includes('flutter'),
    }))
  )
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
      href="/projects"
      class="special-border glass-card group flex items-center gap-2 px-4 py-2 transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-800/40"
    >
      <FaArrowLeft
        class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
      />
      <span class="text-sm font-medium">Back to Projects</span>
    </a>
  </div>

  <!-- Enhanced Hero Section -->
  <section class="reveal relative px-4 pt-10 pb-8 sm:px-6 sm:pt-16 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 text-center">
        <!-- Enhanced Project Category/Type Badge -->
        <div class="mb-6 flex flex-wrap justify-center gap-3">
          <span
            class="special-border glass-card bg-linear-to-r {platformBadge?.color} px-4 py-2 text-sm font-medium {platformBadge?.textColor}"
          >
            {platformBadge?.label}
          </span>

          <!-- Project Status Badge -->
          <span
            class="special-border glass-card bg-linear-to-r {statusBadge?.color} px-4 py-2 text-sm font-medium {statusBadge?.textColor}"
          >
            {statusBadge?.label}
          </span>

          <!-- Featured Project Badge -->
          {#if project.isFeatured}
            <span
              class="special-border glass-card flex items-center gap-2 bg-linear-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400"
            >
              <FaStar class="h-4 w-4" />
              Featured
            </span>
          {/if}
        </div>

        <!-- Project Title -->
        <h1
          class="mb-6 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-4xl leading-tight font-bold text-transparent md:text-6xl lg:text-7xl dark:from-white dark:via-gray-100 dark:to-white"
        >
          {project.title}
        </h1>

        <!-- Enhanced Project Description -->
        <p
          class="mx-auto mb-6 max-w-3xl text-lg leading-relaxed text-gray-600 md:text-xl dark:text-gray-300"
        >
          {project.description ||
            'A showcase of problem-solving and creativity.'}
        </p>

        <!-- Quick Project Stats -->
        <div
          class="mb-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400"
        >
          <div class="flex items-center gap-2">
            <div class="bg-primary-500 h-2 w-2 rounded-full"></div>
            <span>{project.Tags?.length || 0} Technologies</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-green-500"></div>
            <span>{project.imageUrls?.length || 0} Screenshots</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="bg-secondary-500 h-2 w-2 rounded-full"></div>
            <span>Complexity: {project.complexity}/5</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-orange-500"></div>
            <span>{developerRole}</span>
          </div>
        </div>

        <!-- Enhanced Quick Actions -->
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          {#if project.githubLink}
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary special-border group inline-flex items-center gap-2 px-6 py-3 font-medium"
            >
              <FaGithub class="h-5 w-5" />
              View Source Code
              <FaExternalLinkAlt
                class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          {/if}
          {#if project.googlePlayLink}
            <a
              href={project.googlePlayLink}
              target="_blank"
              rel="noopener noreferrer"
              class="btn-secondary special-border group inline-flex items-center gap-2 px-6 py-3 font-medium"
            >
              <FaGooglePlay class="h-5 w-5" />
              Google Play
              <FaExternalLinkAlt
                class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          {/if}
          {#if project.appStoreLink}
            <a
              href={project.appStoreLink}
              target="_blank"
              rel="noopener noreferrer"
              class="btn-secondary special-border group inline-flex items-center gap-2 px-6 py-3 font-medium"
            >
              <FaAppStoreIos class="h-5 w-5" />
              App Store
              <FaExternalLinkAlt
                class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Enhanced Screenshot Gallery -->
  {#if project.imageUrls?.length > 0}
    <section class="px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">Project Gallery</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Explore the interface and design in detail
          </p>
        </div>

        <EnhancedGallery
          images={project.imageUrls}
          videos={project.video}
          projectTitle={project.title}
          selectedIndex={selectedImageIndex}
          onIndexChange={(index) => (selectedImageIndex = index)}
        />
      </div>
    </section>
  {/if}

  <!-- Enhanced Content Sections -->
  <section class="px-4 py-16 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl space-y-8">
      <!-- Technology Stack - Full Width -->
      {#if enhancedTags.length > 0}
        <div class="reveal special-border glass-card p-6">
          <div class="mb-5 flex items-center gap-3">
            <div
              class="special-border glass-card bg-linear-to-r from-green-500/20 to-teal-500/20 p-2"
            >
              <FaMobile class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Technology Stack
            </h2>
          </div>
          <div class="flex flex-wrap gap-2">
            {#each enhancedTags as tag (tag.id)}
              <span
                class="special-border glass-card px-3 py-2 text-sm font-medium transition-transform duration-200 hover:scale-105 {tag.isFavorite
                  ? 'from-primary-500/20 to-secondary-500/20 text-primary-700 ring-primary-500/30 dark:text-primary-300 bg-linear-to-r ring-2'
                  : 'bg-linear-to-r from-gray-500/10 to-gray-600/10 text-gray-700 dark:text-gray-300'}"
              >
                {#if tag.isFavorite}
                  <FaHeart class="mr-1 inline h-3 w-3" />
                {/if}
                {tag.name}
                {#if tag.isFavorite}<span class="ml-1 text-xs">★</span>{/if}
              </span>
            {/each}
          </div>
          {#if enhancedTags.some((tag) => tag.isFavorite)}
            <p class="text-primary-600 dark:text-primary-400 mt-4 text-sm">
              ★ Flutter is highlighted as the preferred technology for mobile
              development
            </p>
          {/if}
        </div>
      {/if}

      <!-- About This Project - Full Width -->
      <div class="reveal special-border glass-card p-6">
        <div class="mb-5 flex items-center gap-3">
          <div
            class="special-border glass-card from-primary-500/20 to-secondary-500/20 bg-linear-to-r p-2"
          >
            <FaCode class="text-primary-600 dark:text-primary-400 h-5 w-5" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            About This Project
          </h2>
        </div>
        <div class="prose prose-lg prose-gray dark:prose-invert max-w-none">
          {#if project.longDescription && project.longDescription.length > 0}
            <StrapiBlocks content={project.longDescription} />
          {:else}
            <div class="space-y-4">
              <p class="leading-relaxed text-gray-700 dark:text-gray-300">
                {project.description ||
                  'This project showcases modern development with a focus on user experience and clean design patterns.'}
              </p>
              <p class="leading-relaxed text-gray-600 dark:text-gray-400">
                Built with attention to detail, this application demonstrates
                best practices in {[
                  'android',
                  'ios',
                  'android-and-ios',
                ].includes(project.platformType)
                  ? 'mobile'
                  : 'web'} development, responsive design, and user interface optimization.
              </p>
              {#if project.isFeatured}
                <p class="leading-relaxed text-gray-600 dark:text-gray-400">
                  As a featured project, this work represents some of the
                  highest quality development in the portfolio.
                </p>
              {/if}
            </div>
          {/if}
        </div>
      </div>

      <!-- Project Access & Analytics - Side by Side -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Project Links - Only show if there are links -->
        {#if project.githubLink || project.googlePlayLink || project.appStoreLink}
          <div
            class="reveal special-border glass-card bg-linear-to-br from-gray-500/5 to-slate-500/5 p-6"
          >
            <h3 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Project Access
            </h3>
            <div class="space-y-3">
              {#if project.githubLink}
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="special-border glass-card group block w-full bg-linear-to-r from-gray-500/5 to-gray-600/5 p-4 transition-all duration-300 hover:from-gray-500/10 hover:to-gray-600/10"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <FaGithub
                        class="h-5 w-5 text-gray-700 dark:text-gray-300"
                      />
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">
                          Source Code Repository
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                          View implementation details
                        </div>
                      </div>
                    </div>
                    <FaExternalLinkAlt
                      class="h-4 w-4 text-gray-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </a>
              {/if}
              {#if project.googlePlayLink}
                <a
                  href={project.googlePlayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="special-border glass-card group block w-full bg-linear-to-r from-green-500/5 to-teal-500/5 p-4 transition-all duration-300 hover:from-green-500/10 hover:to-teal-500/10"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <FaGooglePlay
                        class="h-5 w-5 text-green-600 dark:text-green-400"
                      />
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">
                          Download Application
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                          Available on Google Play Store
                        </div>
                      </div>
                    </div>
                    <FaExternalLinkAlt
                      class="h-4 w-4 text-gray-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </a>
              {/if}
              {#if project.appStoreLink}
                <a
                  href={project.appStoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="special-border glass-card group block w-full bg-linear-to-r from-blue-500/5 to-sky-500/5 p-4 transition-all duration-300 hover:from-blue-500/10 hover:to-sky-500/10"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <FaAppStoreIos
                        class="h-5 w-5 text-blue-600 dark:text-blue-400"
                      />
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">
                          Download Application
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                          Available on Apple App Store
                        </div>
                      </div>
                    </div>
                    <FaExternalLinkAlt
                      class="h-4 w-4 text-gray-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </a>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Project Analytics -->
        <div
          class="reveal special-border glass-card from-primary-500/5 to-secondary-500/5 bg-linear-to-br p-6"
        >
          <h3 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Project Analytics
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">
                Completeness Score
              </span>
              <span class="font-medium text-gray-900 dark:text-white">
                {analysis.projectInsights.completeness}%
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">
                Technical Complexity
              </span>
              <span class="font-medium text-gray-900 dark:text-white">
                {analysis.projectInsights.technicalComplexity}/10
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">
                Platform Reach
              </span>
              <span class="font-medium text-gray-900 dark:text-white">
                {analysis.projectInsights.platformReach} Platform{analysis
                  .projectInsights.platformReach !== 1
                  ? 's'
                  : ''}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">
                Visual Documentation
              </span>
              <span class="font-medium text-gray-900 dark:text-white">
                {analysis.projectInsights.visualRichness} Asset{analysis
                  .projectInsights.visualRichness !== 1
                  ? 's'
                  : ''}
              </span>
            </div>
            {#if analysis.availabilityMetrics.accessibilityScore}
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">
                  Accessibility
                </span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {analysis.availabilityMetrics.accessibilityScore}%
                </span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Project Overview Cards - before Key Features -->
  <section class="px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="reveal">
        <ProjectOverviewCards {project} {analysis} />
      </div>
    </div>
  </section>

  <!-- Features Showcase Section -->
  <section class="px-4 py-16 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <FeaturesShowcase {project} />
    </div>
  </section>
</div>
