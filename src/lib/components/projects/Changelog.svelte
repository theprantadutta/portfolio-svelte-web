<script lang="ts">
  import {
    CHANGELOG_COLORS,
    CHANGELOG_INK,
    type ChangelogRow,
  } from '$lib/projects'
  import { reveal } from '$lib/motion/reveal'

  let { rows }: { rows: ChangelogRow[] } = $props()
</script>

<!-- `git log --oneline` for one project (README §04). -->
<section class="card changelog" aria-label="Changelog">
  <div class="card-header">changelog · git log --oneline</div>
  <ol use:reveal={{ stagger: true }}>
    {#each rows as row (row.hash)}
      <li>
        <span class="lane" aria-hidden="true">
          <span class="line"></span>
          <span class="node" style:--c={CHANGELOG_COLORS[row.type]}></span>
        </span>
        <span class="hash">{row.hash}</span>
        <span class="msg">
          <span class="type" style:color={CHANGELOG_INK[row.type]}
            >{row.type}:</span
          >
          {row.message}
        </span>
        <time class="year" datetime={row.date}>{row.year}</time>
      </li>
    {/each}
  </ol>
</section>

<style>
  .changelog {
    overflow: hidden;
    box-shadow: none;
  }

  ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 22px 80px minmax(0, 1fr) 80px;
    gap: 12px;
    align-items: center;
    min-height: 46px;
    padding: 0 20px;
    border-bottom: 1px solid var(--row-divider);
  }

  li:last-child {
    border-bottom: 0;
  }

  .lane {
    position: relative;
    display: flex;
    justify-content: center;
    align-self: stretch;
  }

  .line {
    width: 2px;
    background: var(--border);
  }

  li:first-child .line {
    margin-top: 23px;
  }

  li:last-child .line {
    margin-bottom: 23px;
  }

  li:only-child .line {
    display: none;
  }

  .node {
    position: absolute;
    top: 50%;
    width: 12px;
    height: 12px;
    margin-top: -6px;
    border-radius: 50%;
    background: var(--surface);
    border: 3px solid var(--c);
  }

  .hash,
  .year {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-4);
  }

  .year {
    text-align: right;
  }

  .msg {
    padding: 12px 0;
    font-size: 14.5px;
    line-height: 1.4;
  }

  .type {
    font-family: var(--font-mono);
  }

  @media (max-width: 767px) {
    li {
      grid-template-columns: 22px minmax(0, 1fr) 44px;
      padding: 0 14px;
    }

    .hash {
      display: none;
    }
  }
</style>
