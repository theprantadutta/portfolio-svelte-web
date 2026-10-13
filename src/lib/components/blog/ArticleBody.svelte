<script lang="ts">
  import { replaceState } from '$app/navigation'
  import { page } from '$app/state'

  import { copyText, toast } from '$lib/toast.svelte'

  interface Props {
    /** Post-processed on the server by processArticleHtml. */
    html: string
    element?: HTMLElement
  }

  let { html, element = $bindable() }: Props = $props()

  const resetTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>()

  /**
   * One delegated handler for everything clickable inside the article: the
   * code blocks' copy buttons and the headings' `#` links. The HTML is
   * dev.to's, rendered with {@html}, so there are no components to hang
   * handlers on.
   */
  const onclick = async (event: MouseEvent) => {
    const target = event.target as HTMLElement

    const copy = target.closest<HTMLElement>('[data-copy]')
    if (copy) {
      const code =
        copy.closest('figure')?.querySelector('pre')?.textContent ?? ''
      try {
        await navigator.clipboard.writeText(code.replace(/\n$/, ''))
      } catch {
        toast.error('Could not copy. Your browser blocked clipboard access.')
        return
      }
      // "copy" → "copied ✓", then back after 1.6s (MOTION §4 "Code blocks").
      copy.dataset.copied = ''
      clearTimeout(resetTimers.get(copy))
      resetTimers.set(
        copy,
        setTimeout(() => delete copy.dataset.copied, 1600)
      )
      return
    }

    const anchor = target.closest<HTMLAnchorElement>('a.heading-anchor')
    if (anchor) {
      event.preventDefault()
      const url = new URL(anchor.href)
      replaceState(url, page.state)
      document
        .getElementById(url.hash.slice(1))
        ?.scrollIntoView({ block: 'start' })
      await copyText(url.href, 'link copied')
    }
  }
</script>

<!-- Clicks are delegated to the buttons and links inside, which are keyboard-operable themselves. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="article-body" bind:this={element} {onclick}>
  <span id="intro" class="intro-marker"></span>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- the author's own dev.to article, sanitised by dev.to and reshaped on the server -->
  {@html html}
</div>

<style>
  .article-body {
    font-size: 19px;
    line-height: 1.75;
    color: var(--ink-body);
    overflow-wrap: break-word;
  }

  .intro-marker {
    display: block;
    scroll-margin-top: 96px;
  }

  .article-body
    :global(:is(p, ul, ol, blockquote, figure, pre, .table-wrap, iframe)) {
    margin: 0 0 22px;
  }

  .article-body :global(:is(h2, h3, h4)) {
    position: relative;
    margin: 40px 0 14px;
    color: var(--ink);
    scroll-margin-top: 96px;
    text-wrap: balance;
  }

  .article-body :global(h2) {
    font-size: 26px;
    line-height: 1.2;
    letter-spacing: -0.02em;
    font-weight: 700;
  }

  .article-body :global(h3) {
    font-size: 21px;
    line-height: 1.3;
    letter-spacing: -0.015em;
    font-weight: 650;
  }

  .article-body :global(h4) {
    font-size: 18px;
    line-height: 1.35;
    font-weight: 650;
  }

  /* The `#` that appears beside a heading on hover (MOTION §4). */
  .article-body :global(.heading-anchor) {
    position: absolute;
    left: -1.1em;
    padding-right: 0.3em;
    color: var(--ink-4);
    font-family: var(--font-mono);
    font-weight: 400;
    text-decoration: none;
    opacity: 0;
    transition: opacity var(--dur-1) linear;
  }

  .article-body :global(:is(h2, h3, h4):hover .heading-anchor),
  .article-body :global(.heading-anchor:focus-visible) {
    opacity: 1;
  }

  .article-body :global(.heading-anchor:hover) {
    color: var(--blue-ink);
  }

  .article-body :global(a:not(.heading-anchor, .article-body-image-wrapper)) {
    color: var(--blue-ink);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    text-decoration-color: color-mix(
      in oklch,
      var(--blue-ink) 40%,
      transparent
    );
  }

  .article-body :global(strong) {
    color: var(--ink);
    font-weight: 700;
  }

  .article-body :global(:not(pre) > code) {
    padding: 2px 6px;
    border-radius: 6px;
    background: var(--chip);
    font-family: var(--font-mono);
    font-size: 0.82em;
    color: var(--ink);
  }

  .article-body :global(:is(ul, ol)) {
    padding-left: 1.3em;
  }

  .article-body :global(li + li) {
    margin-top: 6px;
  }

  .article-body :global(li > :is(ul, ol)) {
    margin: 6px 0 0;
  }

  .article-body :global(blockquote) {
    padding: 2px 0 2px 18px;
    border-left: 3px solid var(--border-strong);
    color: var(--ink-2);
  }

  .article-body :global(blockquote > :last-child) {
    margin-bottom: 0;
  }

  .article-body :global(hr) {
    margin: 36px 0;
    border: 0;
    border-top: 1px solid var(--divider);
  }

  .article-body :global(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin-inline: auto;
    border-radius: 14px;
    border: 1px solid var(--border);
  }

  .article-body :global(iframe) {
    display: block;
    width: 100%;
    max-width: 100%;
    border: 0;
    border-radius: 14px;
  }

  .article-body :global(iframe[src*='youtube']) {
    aspect-ratio: 16 / 9;
    height: auto;
  }

  /* dev.to liquid embeds (GitHub repos, links, tweets) */
  .article-body :global([class^='ltag']) {
    max-width: 100%;
    margin: 0 0 22px;
    border-radius: 14px;
    overflow: hidden;
  }

  .article-body :global(.table-wrap) {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 14px;
  }

  .article-body :global(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
    line-height: 1.5;
  }

  .article-body :global(:is(th, td)) {
    padding: 10px 14px;
    border-bottom: 1px solid var(--row-divider);
    text-align: left;
    vertical-align: top;
  }

  .article-body :global(th) {
    background: var(--surface-muted);
    color: var(--ink);
    font-weight: 600;
  }

  /* --- Code blocks -------------------------------------------------------- */

  .article-body :global(.code-block) {
    overflow: hidden;
    border-radius: 14px;
    background: var(--code-bg);
    color: var(--code-ink);
  }

  .article-body :global(.code-head) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid var(--code-border);
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--code-comment);
  }

  .article-body :global(.code-copy) {
    position: relative;
    display: inline-grid;
    min-height: 24px;
    padding: 0 2px;
    color: var(--code-comment);
    font: inherit;
    transition: color var(--dur-1) linear;
  }

  .article-body :global(.code-copy:hover) {
    color: var(--code-ink);
  }

  .article-body :global(.code-copy > span) {
    grid-area: 1 / 1;
    justify-self: end;
    align-self: center;
    transition:
      opacity var(--dur-2) var(--ease-out),
      translate var(--dur-2) var(--ease-out);
  }

  .article-body :global(.copy-done) {
    opacity: 0;
    translate: 0 6px;
    color: oklch(0.78 0.12 150);
    white-space: nowrap;
  }

  .article-body :global(.code-copy[data-copied] .copy-idle) {
    opacity: 0;
    translate: 0 -6px;
  }

  .article-body :global(.code-copy[data-copied] .copy-done) {
    opacity: 1;
    translate: none;
  }

  .article-body :global(.code-block pre) {
    margin: 0;
    padding: 16px 18px;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.75;
    tab-size: 2;
  }

  .article-body :global(.code-block code) {
    font: inherit;
  }

  /* Rouge's token classes (what dev.to highlights with), coloured from the
     accent palette. */
  .article-body
    :global(.highlight :is(.c, .c1, .cm, .cd, .cp, .cs, .ch, .cpf)) {
    color: var(--code-comment);
    font-style: italic;
  }

  .article-body
    :global(.highlight :is(.k, .kd, .kn, .kp, .kr, .kv, .kc, .nt, .ow)) {
    color: var(--code-keyword);
  }

  .article-body :global(.highlight :is(.kt, .nc, .nn, .nb, .bp, .ne, .no)) {
    color: var(--code-type);
  }

  .article-body :global(.highlight :is(.nf, .fm, .na, .nd)) {
    color: var(--code-fn);
  }

  .article-body
    :global(
      .highlight
        :is(.s, .s1, .s2, .sb, .sc, .sd, .se, .sh, .si, .sr, .ss, .sx, .dl)
    ) {
    color: var(--code-string);
  }

  .article-body :global(.highlight :is(.m, .mi, .mf, .mh, .mo, .mb, .mx, .il)) {
    color: var(--code-number);
  }

  .article-body :global(.highlight :is(.gi)) {
    color: oklch(0.78 0.12 150);
  }

  .article-body :global(.highlight :is(.gd, .err)) {
    color: oklch(0.72 0.14 25);
  }

  .article-body :global(.highlight :is(.gh, .gu)) {
    color: var(--code-type);
  }

  @media (max-width: 767px) {
    .article-body {
      font-size: 16.5px;
      line-height: 1.7;
    }

    .article-body
      :global(:is(p, ul, ol, blockquote, figure, pre, .table-wrap, iframe)) {
      margin-bottom: 18px;
    }

    .article-body :global(h2) {
      font-size: 22px;
    }

    .article-body :global(h3) {
      font-size: 18.5px;
    }

    .article-body :global(.code-block) {
      border-radius: 12px;
    }

    .article-body :global(.code-block pre) {
      padding: 14px;
      font-size: 12.5px;
      line-height: 1.7;
    }

    /* No hover on touch, and no room in the margin: the # sits inline. */
    .article-body :global(.heading-anchor) {
      display: none;
    }
  }
</style>
