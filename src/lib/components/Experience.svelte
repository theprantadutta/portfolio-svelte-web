<script lang="ts">
  import SectionHeading from '$components/SectionHeading.svelte'
  import SectionMarker from '$components/SectionMarker.svelte'
  import SectionSubheading from '$components/SectionSubheading.svelte'
  import Timeline from '$components/ui/Timeline.svelte'
  import type { TimelineItemData } from '$lib/types/timeline'
  import type { ExperienceDataAttributes } from '$lib/types/types'
  import CgWorkAlt from '$icons/CgWorkAlt.svelte'

  let { experiences }: { experiences: ExperienceDataAttributes[] } = $props()

  const timelineItems = $derived<TimelineItemData[]>(
    experiences.map((item) => ({
      date: item.date,
      title: item.title,
      location: item.location,
      description: item.description,
      icon: CgWorkAlt,
    }))
  )
</script>

<section id="experience" class="section-spacing-sm scroll-mt-28">
  <SectionMarker section="Experience" threshold={0.1} />
  <!-- Section Header -->
  <div class="mb-16 text-center">
    <SectionHeading>My Experience</SectionHeading>
    <SectionSubheading>
      My professional journey and the experiences that shaped my skills
    </SectionSubheading>
  </div>

  <!-- Custom Timeline -->
  <Timeline items={timelineItems} />
</section>
