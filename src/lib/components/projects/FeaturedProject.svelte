<script lang="ts" module>
  import type { ImageRef } from '#lib/projects.js'

  /** The slice of a project the home page's cards use. */
  export interface FeaturedProjectView {
    slug: string
    title: string
    description: string
    language: string | null
    metric: string | null
    year: string
    graphic: ImageRef
  }
</script>

<script lang="ts">
  import { spotlight } from '#lib/motion/pointer.js'
  import { languageColor } from '#lib/projects.js'

  let { project }: { project: FeaturedProjectView } = $props()
</script>

<!--
  One project on the home page: its feature graphic, framed inside the card
  like the pinned project on /projects. The graphic and title share their
  view-transition names with the project page, so they morph into it.
-->
<a
  class="card lift spotlight featured"
  href="/projects/{project.slug}"
  use:spotlight
  data-sveltekit-preload-data="hover"
>
  <span
    class="graphic"
    style:view-transition-name="project-shot-{project.slug}"
  >
    <img
      src={project.graphic.url}
      srcset={project.graphic.srcset}
      sizes="(max-width: 767px) 80vw, (max-width: 1023px) 30vw, 370px"
      alt="{project.title} feature graphic"
      width={project.graphic.width}
      height={project.graphic.height}
      loading="lazy"
      decoding="async"
    />
  </span>

  <span class="text">
    <h3 class="title" style:view-transition-name="project-title-{project.slug}">
      {project.title}
    </h3>
    <span class="desc">{project.description}</span>
    <span class="foot">
      {#if project.language}
        <span class="lang">
          <i class="dot" style:--c={languageColor(project.language)}></i>
          {project.language}
        </span>
      {/if}
      {#if project.metric}
        <span class="metric">{project.metric}</span>
      {/if}
      <span class="year">{project.year}</span>
    </span>
  </span>
</a>

<style>
  .featured {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
    padding: 10px;
    box-shadow: 0 20px 40px -32px rgb(0 0 0 / 0.3);
    container-type: inline-size;
  }

  .graphic {
    display: block;
    overflow: hidden;
    aspect-ratio: 1024 / 500;
    border-radius: 11px;
    border: 1px solid var(--border);
    background: var(--surface-muted);
  }

  .graphic img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: scale 600ms var(--ease-out);
  }

  @media (hover: hover) {
    .featured:hover .graphic img {
      scale: 1.03;
    }
  }

  .text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    padding: 0 8px 8px;
  }

  .title {
    margin: 0;
    width: fit-content;
    max-width: 100%;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
    color: var(--ink);
  }

  .desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-2);
  }

  .foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
    margin-top: auto;
    padding-top: 6px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-3);
  }

  .lang {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--c);
  }

  .metric {
    color: var(--green-ink);
  }

  .year {
    margin-left: auto;
    color: var(--ink-4);
  }

  /* Too narrow for all three on one line, so the year gives way rather than
     dropping to a row of its own and pushing this card out of step. */
  @container (max-width: 214px) {
    .metric + .year {
      display: none;
    }
  }
</style>
