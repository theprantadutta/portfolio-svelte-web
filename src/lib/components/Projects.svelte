<script lang="ts">
  import AllProjectButton from '$components/AllProjectButton.svelte'
  import Project from '$components/Project.svelte'
  import ProjectTagFilter from '$components/ProjectTagFilter.svelte'
  import SectionHeading from '$components/SectionHeading.svelte'
  import SectionMarker from '$components/SectionMarker.svelte'
  import SectionSubheading from '$components/SectionSubheading.svelte'
  import type { ProjectDataAttributes } from '$lib/types/types'

  interface Props {
    showAllProjects: boolean
    projects: ProjectDataAttributes[]
    allTags?: string[]
    selectedTags?: string[]
  }

  let { showAllProjects, projects, allTags, selectedTags }: Props = $props()
</script>

<section id="projects" class="section-spacing-sm scroll-mt-28">
  <SectionMarker section="Projects" threshold={0.3} />
  <div class="mb-16 text-center">
    <SectionHeading>My projects</SectionHeading>
    <SectionSubheading>
      Products and tools I've designed, built, and shipped
    </SectionSubheading>
  </div>
  {#if allTags && selectedTags}
    <ProjectTagFilter {allTags} {selectedTags} />
  {/if}
  <div>
    {#each projects as project (project.documentId ?? project.id)}
      <Project {project} />
    {/each}
  </div>
  {#if !showAllProjects}
    <AllProjectButton />
  {/if}
</section>
