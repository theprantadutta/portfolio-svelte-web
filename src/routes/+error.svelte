<script lang="ts">
  import PageGlow from '$components/chrome/PageGlow.svelte'
  import { page } from '$app/state'

  const notFound = $derived(page.status === 404)
  const headline = $derived(
    notFound
      ? 'fatal: page not found'
      : `fatal: ${page.status} ${page.error?.message ?? 'error'}`
  )
  const path = $derived(page.url.pathname)
</script>

<svelte:head>
  <title>{notFound ? 'Page not found' : 'Error'} | Pranta Dutta</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<PageGlow
  glows={[
    {
      hue: 'orange',
      width: 700,
      height: 500,
      right: -200,
      top: -200,
      drift: 2,
    },
  ]}
/>

<div class="container-page page">
  <p class="cmd enter" style:--d="0ms">$ git checkout {path}</p>
  <h1 class="fatal enter" style:--d="120ms">
    {headline}<span class="caret" aria-hidden="true"></span>
  </h1>
  <p class="hint enter" style:--d="240ms">
    {#if notFound}
      error: pathspec '{path}' did not match any file(s) known to git.
    {:else}
      Something broke on the way here. Reloading usually fixes it.
    {/if}
  </p>
  <div class="enter" style:--d="360ms">
    <a class="btn btn-primary" href="/"
      >$ git checkout main <span class="arrow">→</span></a
    >
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: calc(100dvh - 160px);
    justify-content: center;
    padding-bottom: 48px;
  }

  .cmd,
  .hint {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--ink-3);
    overflow-wrap: anywhere;
  }

  .fatal {
    margin: 0;
    font-family: var(--font-mono);
    font-size: clamp(30px, 6vw, 72px);
    font-weight: 600;
    letter-spacing: -0.04em;
    line-height: 1.05;
    overflow-wrap: anywhere;
  }

  .caret {
    display: inline-block;
    width: 0.55em;
    height: 0.95em;
    margin-left: 0.08em;
    vertical-align: -0.1em;
    background: var(--orange);
    animation: blink 1s step-end infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .caret {
      animation: none;
    }
  }
</style>
