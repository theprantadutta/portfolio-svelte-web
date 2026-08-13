<script lang="ts">
  import SectionHeading from '$components/SectionHeading.svelte'
  import SectionMarker from '$components/SectionMarker.svelte'
  import SectionSubheading from '$components/SectionSubheading.svelte'
  import { openSourceContributions } from '$lib/data/open-source'
  import FaCodeBranch from '$icons/FaCodeBranch.svelte'
  import FaGithub from '$icons/FaGithub.svelte'
  import FiCheckCircle from '$icons/FiCheckCircle.svelte'
  import FiChevronDown from '$icons/FiChevronDown.svelte'
  import FiExternalLink from '$icons/FiExternalLink.svelte'

  const chipClass =
    'special-border hover:text-primary-600 dark:hover:text-primary-400 inline-flex items-center gap-1 border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors duration-300 hover:border-white/20 dark:bg-gray-900/40 dark:text-gray-300'

  const totalPrs = openSourceContributions.reduce(
    (sum, c) => sum + c.pullRequests.length,
    0
  )
  const projectCount = openSourceContributions.length
  const issuesFixed = openSourceContributions.reduce(
    (sum, c) =>
      sum + c.pullRequests.reduce((s, pr) => s + (pr.resolves?.length ?? 0), 0),
    0
  )

  const stats = [
    {
      icon: FaCodeBranch,
      value: totalPrs,
      label: totalPrs === 1 ? 'Merged PR' : 'Merged PRs',
    },
    {
      icon: FaGithub,
      value: projectCount,
      label: projectCount === 1 ? 'Project' : 'Projects',
    },
    {
      icon: FiCheckCircle,
      value: issuesFixed,
      label: issuesFixed === 1 ? 'Issue Fixed' : 'Issues Fixed',
    },
  ]
</script>

{#if openSourceContributions.length > 0}
  <section id="open-source" class="section-spacing-sm w-full scroll-mt-28">
    <SectionMarker section="Open Source" threshold={0.1} />

    <!-- Section Header -->
    <div class="mb-12 text-center">
      <SectionHeading>Open Source</SectionHeading>
      <SectionSubheading>
        Production fixes I've merged into the tools other developers rely on
      </SectionSubheading>

      <!-- Summary stats -->
      <div class="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-3 sm:gap-4">
        {#each stats as stat (stat.label)}
          {@const StatIcon = stat.icon}
          <div
            class="special-border glass-card bg-white/5 px-2 py-4 text-center backdrop-blur-lg dark:bg-gray-900/20"
          >
            <StatIcon class="text-primary-500 mx-auto mb-2 h-5 w-5" />
            <div
              class="from-primary-600 to-secondary-600 bg-linear-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl"
            >
              {stat.value}
            </div>
            <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="content-container">
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {#each openSourceContributions as contribution, index (contribution.repo)}
          <details
            open={index === 0}
            class="group special-border glass-card border-white/10 bg-white/5 backdrop-blur-lg dark:bg-gray-900/20"
          >
            <!-- Compact summary row (always visible) -->
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden"
            >
              <div class="flex min-w-0 items-center gap-3">
                <FaGithub
                  class="h-6 w-6 shrink-0 text-gray-700 dark:text-gray-300"
                />
                <div class="min-w-0">
                  <h3 class="truncate font-bold">{contribution.name}</h3>
                  <span class="text-xs text-gray-500">{contribution.repo}</span>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <span
                  class="special-border bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-900/40 dark:text-gray-400"
                >
                  {contribution.pullRequests.length} merged
                </span>
                {#if contribution.stat}
                  <span
                    class="from-primary-500/15 to-secondary-500/15 text-primary-700 dark:text-primary-300 special-border hidden bg-linear-to-r px-2.5 py-1 text-xs font-medium sm:inline"
                  >
                    {contribution.stat}
                  </span>
                {/if}
                <FiChevronDown
                  class="h-5 w-5 text-gray-400 transition-transform duration-300 group-open:rotate-180"
                />
              </div>
            </summary>

            <!-- Expanded detail -->
            <div class="border-t border-white/10 px-5 pb-5">
              <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {contribution.description}
              </p>

              <!-- Project-level links -->
              <div class="mt-4 mb-5 flex flex-wrap items-center gap-2">
                {#if contribution.shippedIn}
                  <span
                    class="special-border bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400"
                  >
                    Shipped in {contribution.shippedIn}
                  </span>
                {/if}
                <a
                  href={contribution.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class={chipClass}
                >
                  Repository
                  <FiExternalLink class="h-3 w-3" />
                </a>
                {#each contribution.links ?? [] as link (link.url)}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class={chipClass}
                  >
                    {link.label}
                    <FiExternalLink class="h-3 w-3" />
                  </a>
                {/each}
              </div>

              <!-- Merged pull requests -->
              <ul class="space-y-3">
                {#each contribution.pullRequests as pr (pr.number)}
                  <li
                    class="special-border border border-white/10 bg-white/5 p-4 dark:bg-gray-900/30"
                  >
                    <div class="flex gap-3">
                      <FaCodeBranch
                        class="text-primary-500 mt-1 h-4 w-4 shrink-0"
                      />
                      <div class="min-w-0">
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex flex-wrap items-center gap-2 hover:underline"
                        >
                          <span class="font-medium">{pr.title}</span>
                          <span class="text-xs text-gray-500">#{pr.number}</span
                          >
                          <FiExternalLink class="h-3.5 w-3.5 text-gray-400" />
                        </a>
                        <p
                          class="mt-1 text-sm text-gray-600 dark:text-gray-400"
                        >
                          {pr.description}
                        </p>

                        {#if pr.resolves && pr.resolves.length > 0}
                          <div class="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              class="inline-flex items-center gap-1 text-xs text-gray-500"
                            >
                              <FiCheckCircle
                                class="h-3.5 w-3.5 text-green-600 dark:text-green-500"
                              />
                              Fixes
                            </span>
                            {#each pr.resolves as issue (`${issue.repo}#${issue.number}`)}
                              <a
                                href={issue.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class={chipClass}
                              >
                                {issue.repo === contribution.repo
                                  ? `#${issue.number}`
                                  : `${issue.repo}#${issue.number}`}
                                <FiExternalLink class="h-3 w-3" />
                              </a>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    </div>
                  </li>
                {/each}
              </ul>
            </div>
          </details>
        {/each}
      </div>
    </div>
  </section>
{/if}
