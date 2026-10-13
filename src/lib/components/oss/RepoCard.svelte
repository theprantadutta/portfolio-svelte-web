<script lang="ts">
  import { spotlight } from '#lib/motion/pointer.js'

  interface Props {
    repo: {
      /** `owner/name` */
      repo: string
      /** Friendly project name, e.g. "Flutter Framework" */
      name: string
      url: string
      /** Merged pull requests listed on the page for this repository */
      merged: number
      stars: number | null
      language: { name: string; color: string | null } | null
      avatarUrl: string | null
    }
  }

  let { repo }: Props = $props()

  const [owner, name] = $derived(repo.repo.split('/'))

  const compact = new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
  const stars = $derived(
    repo.stars === null ? null : compact.format(repo.stars).toLowerCase()
  )
</script>

<!-- One repository with merged work in it: the org, the stars, and how many
     of the pull requests below landed there. -->
<a
  class="card lift spotlight repo"
  href={repo.url}
  target="_blank"
  rel="noopener noreferrer"
  style:--spot="var(--purple)"
  use:spotlight
>
  <span class="head">
    {#if repo.avatarUrl}
      <img
        class="avatar"
        src={repo.avatarUrl}
        alt=""
        width="28"
        height="28"
        loading="lazy"
        decoding="async"
      />
    {/if}
    <span class="slug"><span class="owner">{owner}/</span>{name}</span>
    <span class="ne" aria-hidden="true">↗</span>
  </span>
  <span class="name">{repo.name}</span>
  <span class="foot">
    <span class="merged">⇄ {repo.merged} merged</span>
    {#if repo.language}
      <span class="lang">
        <i class="dot" style:--c={repo.language.color ?? undefined}></i>
        {repo.language.name}
      </span>
    {/if}
    {#if stars}
      <span class="stars"><span aria-hidden="true">★</span> {stars}</span>
    {/if}
  </span>
</a>

<style>
  .repo {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    padding: 16px 18px;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .avatar {
    flex: none;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface-muted);
  }

  .slug {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
  }

  .owner {
    font-weight: 400;
    color: var(--ink-3);
  }

  .ne {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-3);
    transition: transform var(--dur-2) var(--ease-out);
  }

  .name {
    font-size: 14px;
    color: var(--ink-2);
  }

  .foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 14px;
    margin-top: auto;
    padding-top: 2px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-3);
  }

  .merged {
    color: var(--purple-ink);
    font-weight: 600;
  }

  .lang {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  @media (hover: hover) {
    .repo:hover .ne {
      transform: translate(2px, -2px);
    }
  }
</style>
