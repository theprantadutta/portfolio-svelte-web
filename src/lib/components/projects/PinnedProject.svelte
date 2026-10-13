<script lang="ts">
  import Phone from '#components/projects/Phone.svelte'
  import { tilt } from '#lib/motion/pointer.js'
  import { languageColor, type ProjectSummary } from '#lib/projects.js'

  let { project }: { project: ProjectSummary } = $props()

  const shot = $derived(project.screenshots[0] ?? project.cover)

  /**
   * Up to three numbers. Authored impact stats come first; the screenshot
   * count is real data too, so it fills a free slot rather than inventing a
   * metric.
   */
  const stats = $derived(
    [
      ...project.impactStats.map((stat) => ({
        value: stat.value,
        label: stat.label,
        highlight: Boolean(stat.highlight),
      })),
      ...(project.screenshots.length
        ? [
            {
              value: String(project.screenshots.length),
              label: 'screens',
              highlight: false,
            },
          ]
        : []),
    ].slice(0, 3)
  )

  const STATUS_TONE = {
    live: 'green',
    'in progress': 'orange',
    planned: 'blue',
  } as const
  const tone = $derived(STATUS_TONE[project.status])
</script>

<article class="pinned card" aria-labelledby="pinned-title">
  <div class="body">
    <div class="pills">
      <span
        class="pill"
        style:--pill="var(--orange)"
        style:--pill-ink="var(--orange-ink)">📌 pinned</span
      >
      <span
        class="pill"
        style:--pill="var(--{tone})"
        style:--pill-ink="var(--{tone}-ink)">● {project.status}</span
      >
    </div>

    <h2 id="pinned-title" class="title">
      <a
        href="/projects/{project.slug}"
        class="stretched"
        style:view-transition-name="project-title-{project.slug}"
        >{project.title}</a
      >
      <span class="live-m" style:color="var(--{tone}-ink)"
        >● {project.status}</span
      >
    </h2>

    <p class="desc">{project.description}</p>

    {#if stats.length}
      <dl class="stats">
        {#each stats as stat (stat.label)}
          <div>
            <dt>{stat.label}</dt>
            <dd class:good={stat.highlight}>{stat.value}</dd>
          </div>
        {/each}
      </dl>
    {/if}

    <div class="langs">
      {#each project.languages as language (language)}
        <span class="lang"
          ><i class="dot" style:--c={languageColor(language)}
          ></i>{language}</span
        >
      {/each}
      {#if project.stack.length}
        <span class="stack">{project.stack.slice(0, 4).join(' · ')}</span>
      {/if}
    </div>

    <div class="actions">
      <a class="btn btn-primary" href="/projects/{project.slug}">
        open case study <span class="arrow">→</span>
      </a>
      {#if project.screenshots.length}
        <a class="btn btn-outline" href="/projects/{project.slug}?tab=screens"
          >screenshots</a
        >
      {/if}
    </div>
  </div>

  <div class="panel" use:tilt>
    {#if project.featureGraphic}
      <!-- The Play Store feature graphic, when the project has one. -->
      <div class="lean flat">
        <img
          class="graphic"
          src={project.featureGraphic.url}
          srcset={project.featureGraphic.srcset}
          sizes="(max-width: 767px) 92vw, 380px"
          alt="{project.title} feature graphic"
          width={project.featureGraphic.width}
          height={project.featureGraphic.height}
          fetchpriority="high"
          style:view-transition-name="project-shot-{project.slug}"
        />
      </div>
    {:else if shot}
      <div class="lean">
        <Phone
          image={shot}
          alt="{project.title} screenshot"
          width={220}
          transitionName="project-shot-{project.slug}"
          priority
        />
      </div>
    {/if}
  </div>
</article>

<style>
  .pinned {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 420px;
    overflow: hidden;
    border-radius: 20px;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 30px;
  }

  .pills {
    display: flex;
    gap: 8px;
  }

  .title {
    margin: 0;
    font-size: 40px;
    font-weight: 700;
    letter-spacing: -0.035em;
    line-height: 1.1;
  }

  /* The title link covers the whole card; the buttons sit above it. */
  .stretched::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .stretched {
    display: inline-block;
  }

  .live-m {
    display: none;
  }

  .desc {
    margin: 0;
    max-width: 520px;
    font-size: 17px;
    line-height: 1.6;
    color: var(--ink-2);
  }

  .stats {
    display: flex;
    gap: 28px;
    margin: 0;
    font-family: var(--font-mono);
  }

  .stats div {
    display: flex;
    flex-direction: column-reverse;
  }

  .stats dd {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.25;
  }

  .stats dd.good {
    color: var(--green-ink);
  }

  .stats dt {
    font-size: 12px;
    color: var(--ink-3);
  }

  .langs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 14px;
    margin-top: auto;
    font-size: 13px;
    color: var(--ink-2);
  }

  .lang {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .actions {
    position: relative;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .actions .btn {
    padding: 12px 18px;
  }

  /* Real screenshots are full-length, so the phone hangs from the top and
     the card's own height (set by the text column) crops it, the way the
     design's shot runs off the bottom edge. */
  .panel {
    position: relative;
    min-height: 340px;
    overflow: hidden;
    background: linear-gradient(160deg, var(--panel-a), var(--panel-b));
    perspective: 1000px;
  }

  /* Leans toward the pointer (MOTION §4), driven by the tilt action. */
  .lean {
    position: absolute;
    top: 30px;
    left: 50%;
    translate: -50% 0;
    display: flex;
    transform: translateY(var(--lift, 0px)) rotateX(var(--rx, 0deg))
      rotateY(var(--ry, 0deg));
    transform-origin: 50% 100%;
    transition: transform 450ms var(--ease-out);
  }

  .lean.flat {
    top: 50%;
    width: calc(100% - 48px);
    translate: -50% -50%;
    transform-origin: 50% 50%;
  }

  .graphic {
    display: block;
    width: 100%;
    aspect-ratio: 1024 / 500;
    object-fit: cover;
    border-radius: 14px;
    box-shadow: 0 24px 50px -24px rgb(0 0 0 / 0.45);
  }

  @media (max-width: 1023px) {
    .pinned {
      grid-template-columns: minmax(0, 1fr) 320px;
    }
  }

  /* Phones: the panel moves on top and the card keeps only the essentials. */
  @media (max-width: 767px) {
    .pinned {
      grid-template-columns: minmax(0, 1fr);
    }

    .panel {
      order: -1;
      height: 200px;
      min-height: 0;
    }

    .lean {
      top: 18px;
    }

    .lean.flat {
      top: 50%;
      width: calc(100% - 32px);
    }

    .graphic {
      border-radius: 10px;
    }

    .panel :global(.phone) {
      width: 140px !important;
      border-width: 5px;
      border-radius: 18px 18px 0 0;
    }

    .body {
      gap: 8px;
      padding: 16px;
    }

    .pills,
    .stats,
    .langs,
    .actions {
      display: none;
    }

    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 22px;
      letter-spacing: -0.03em;
    }

    .live-m {
      display: inline;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0;
    }

    .desc {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      overflow: hidden;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lean {
      transition: none;
    }
  }
</style>
