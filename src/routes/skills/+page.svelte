<script lang="ts">
  import PageGlow from '$components/chrome/PageGlow.svelte'
  import BranchTimeline from '$components/skills/BranchTimeline.svelte'
  import SkillGroupCard from '$components/skills/SkillGroupCard.svelte'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import { SITE_URL } from '$lib/site'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const title = 'Skills & experience | Pranta Dutta'
  const description =
    'Flutter, React Native, ASP.NET Core, Go, Docker and LLM integrations: the stack Pranta Dutta ships with daily, and the roles behind it.'
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="{SITE_URL}/skills" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="{SITE_URL}/skills" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta property="og:image" content="{SITE_URL}/og/skills.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:image" content="{SITE_URL}/og/skills.png" />
</svelte:head>

<PageGlow
  glows={[
    { hue: 'blue', width: 700, height: 500, right: -200, top: -200, drift: 2 },
  ]}
/>

<div class="container-page page">
  <PageHeader
    command="$ git branch -a --sort=-committerdate"
    title="Stack & branches."
  />

  <div class="grid">
    <div class="groups">
      {#each data.groups as group, i (group.name)}
        <div class="enter" style:--d="{300 + i * 50}ms">
          <SkillGroupCard {...group} />
        </div>
      {/each}
      <p class="legend enter" style:--d="{300 + data.groups.length * 50}ms">
        dark chip = daily driver · light chip = comfortable
      </p>
    </div>

    <div class="enter" style:--d="340ms">
      <BranchTimeline entries={data.timeline} />
    </div>
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 26px;
    padding-bottom: 48px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    align-items: start;
  }

  .groups {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .legend {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-4);
  }

  @media (max-width: 1023px) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 767px) {
    .page {
      gap: 18px;
    }
  }
</style>
