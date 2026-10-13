<script lang="ts">
  import { spotlight } from '#lib/motion/pointer.js'
  import { languageColor, type ProjectSummary } from '#lib/projects.js'

  let { project }: { project: ProjectSummary } = $props()

  const language = $derived(project.languages[0])
</script>

<!-- One repo in the grid (README §03): slug, kind, description, footer. -->
<a
  class="card lift spotlight repo"
  href="/projects/{project.slug}"
  use:spotlight
  data-sveltekit-preload-data="hover"
>
  <span class="top">
    <span class="slug">{project.slug}</span>
    <span class="kind">{project.kind}</span>
    {#if project.metric}
      <span class="metric metric-m">{project.metric}</span>
    {/if}
  </span>
  <span class="desc">{project.description}</span>
  <span class="foot">
    {#if language}
      <span class="lang">
        <i class="dot" style:--c={languageColor(language)}></i>{language}
      </span>
    {/if}
    {#if project.metric}
      <span class="metric">{project.metric}</span>
    {:else if project.status !== 'live'}
      <span class="status">{project.status}</span>
    {/if}
    <span class="year">{project.year}</span>
  </span>
</a>

<style>
  .repo {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
    padding: 20px;
    box-shadow: 0 20px 40px -32px rgb(0 0 0 / 0.3);
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .slug {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: 15px;
    font-weight: 600;
    color: var(--blue-ink);
  }

  .kind {
    flex: none;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-3);
  }

  .desc {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    min-height: 3em;
    font-size: 15px;
    line-height: 1.5;
    color: var(--ink-2);
  }

  .foot {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: auto;
    padding-top: 4px;
    font-size: 13px;
    color: var(--ink-2);
  }

  .lang {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .metric,
  .status {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--green-ink);
  }

  .status {
    font-weight: 400;
    color: var(--orange-ink);
  }

  .metric-m {
    display: none;
  }

  .year {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-4);
  }

  /* Phones: compact cards, metric in the corner, no footer (M3). */
  @media (max-width: 767px) {
    .repo {
      gap: 6px;
      padding: 14px 16px;
      border-radius: 16px;
      box-shadow: none;
    }

    .slug {
      font-size: 14px;
    }

    .kind {
      display: none;
    }

    .metric-m {
      display: inline;
      font-size: 13px;
    }

    .desc {
      min-height: 0;
      font-size: 13.5px;
      line-height: 1.45;
    }

    .foot {
      display: none;
    }
  }
</style>
