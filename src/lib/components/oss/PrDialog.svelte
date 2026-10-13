<script lang="ts">
  import X from '@lucide/svelte/icons/x'

  import {
    diffBlocks,
    mergedOn,
    type PullRequestView,
  } from '#components/oss/pr.js'
  import { lockScroll, unlockScroll } from '#lib/smooth-scroll.js'

  /**
   * One pull request's full story, in a modal over /open-source. A native
   * <dialog> opened with showModal(): the top layer, a focus trap, Esc and an
   * inert page come with it. It sets its own margin, because the CSS reset's
   * `margin: 0` would otherwise pin it to the top-left corner.
   */
  let dialog = $state<HTMLDialogElement>()
  let pr = $state<PullRequestView | null>(null)
  let locked = false

  export const show = (next: PullRequestView) => {
    pr = next
    dialog?.showModal()
    if (!locked) lockScroll()
    locked = true
  }

  const release = () => {
    if (locked) unlockScroll()
    locked = false
  }

  const close = () => {
    dialog?.close()
    release()
  }

  // Leaving the page with the dialog open never fires `close`.
  $effect(() => release)

  // A click on the backdrop lands on the <dialog> itself, outside the sheet.
  const onBackdrop = (event: MouseEvent) => {
    if (event.target === dialog) close()
  }

  const blocks = $derived(pr ? diffBlocks(pr) : [])
  const merged = $derived(pr ? mergedOn(pr) : null)
  const paragraphs = $derived(
    pr ? pr.description.split(/\n{2,}/).filter(Boolean) : []
  )
  const owner = $derived(pr?.repo.split('/')[0] ?? '')
  const name = $derived(pr?.repo.split('/')[1] ?? '')
</script>

<dialog
  bind:this={dialog}
  class="pr-dialog"
  aria-labelledby="pr-dialog-title"
  onclose={release}
  onclick={onBackdrop}
>
  {#if pr}
    <div class="sheet">
      <header class="head">
        <span class="repo"><span class="owner">{owner}/</span>{name}</span>
        <span class="merged"><span aria-hidden="true">⇄</span> merged</span>
        <button type="button" class="close" onclick={close} aria-label="Close">
          <X size={18} strokeWidth={1.75} />
        </button>
      </header>

      <div class="body" data-lenis-prevent>
        <p class="meta">
          #{pr.number} · {pr.project}{#if merged}&nbsp;· merged {merged}{/if}
        </p>
        <h2 id="pr-dialog-title">{pr.title}</h2>

        {#if pr.additions !== null && pr.deletions !== null}
          <p class="diff">
            <span class="add">+{pr.additions.toLocaleString('en-US')}</span>
            <span class="del">−{pr.deletions.toLocaleString('en-US')}</span>
            <span class="blocks" aria-hidden="true">
              {#each blocks as kind, i (i)}<i class={kind}></i>{/each}
            </span>
            <span class="lines">lines changed</span>
          </p>
        {/if}

        {#each paragraphs as paragraph, i (i)}
          <p class="desc">{paragraph}</p>
        {/each}

        {#if pr.resolves.length || pr.shippedIn}
          <dl class="facts">
            {#if pr.resolves.length}
              <div>
                <dt>resolves</dt>
                <dd>
                  {#each pr.resolves as issue (issue.url)}
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      >{issue.repo === pr.repo
                        ? ''
                        : issue.repo}#{issue.number}</a
                    >
                  {/each}
                </dd>
              </div>
            {/if}
            {#if pr.shippedIn}
              <div>
                <dt>shipped in</dt>
                <dd>{pr.shippedIn}</dd>
              </div>
            {/if}
          </dl>
        {/if}
      </div>

      <footer class="foot">
        <a
          class="btn btn-primary"
          href={pr.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          view pull request <span class="arrow">↗</span>
        </a>
        <button type="button" class="btn btn-outline" onclick={close}>
          close
        </button>
      </footer>
    </div>
  {/if}
</dialog>

<style>
  .pr-dialog {
    width: min(880px, calc(100vw - 48px));
    max-width: none;
    max-height: none;
    margin: auto;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ink);
    overflow: visible;
  }

  .pr-dialog[open] {
    animation: dialog-in 260ms var(--ease-out);
  }

  .pr-dialog::backdrop {
    background: rgb(8 9 11 / 0.55);
    backdrop-filter: blur(4px);
  }

  @keyframes dialog-in {
    from {
      opacity: 0;
      translate: 0 14px;
      scale: 0.98;
    }
  }

  .sheet {
    display: flex;
    flex-direction: column;
    max-height: min(90dvh, 920px);
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 22px;
    background: var(--surface);
    box-shadow: 0 40px 80px -32px rgb(0 0 0 / 0.5);
  }

  .head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 22px 22px 0 32px;
  }

  .repo {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
  }

  .owner {
    font-weight: 400;
    color: var(--ink-3);
  }

  .merged {
    flex: none;
    padding: 3px 10px;
    border-radius: 999px;
    background: var(--purple);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.3;
  }

  :global([data-theme='dark']) .merged {
    color: #15171c;
  }

  .close {
    display: grid;
    flex: none;
    place-items: center;
    width: 36px;
    height: 36px;
    margin-left: auto;
    border-radius: 999px;
    color: var(--ink-2);
    transition:
      background-color var(--dur-1) linear,
      color var(--dur-1) linear;
  }

  .close:hover {
    background: var(--surface-muted);
    color: var(--ink);
  }

  .body {
    flex: 1;
    min-height: 0;
    padding: 16px 32px 10px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .meta {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-3);
  }

  h2 {
    margin: 8px 0 0;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .diff {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 14px 0 0;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .add {
    color: var(--green-ink);
  }

  .del {
    color: var(--red-ink);
  }

  .blocks {
    display: flex;
    gap: 2px;
  }

  .blocks i {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .blocks .add {
    background: var(--green);
  }

  .blocks .del {
    background: var(--red);
  }

  .blocks .none {
    background: var(--chip);
  }

  .lines {
    color: var(--ink-4);
  }

  .desc {
    margin: 18px 0 0;
    font-size: 16.5px;
    line-height: 1.7;
    color: var(--ink-2);
  }

  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 28px;
    margin: 18px 0 6px;
    padding-top: 14px;
    border-top: 1px solid var(--divider);
    font-family: var(--font-mono);
    font-size: 12.5px;
  }

  .facts dt {
    color: var(--ink-4);
  }

  .facts dd {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 10px;
    margin: 2px 0 0;
    color: var(--ink-2);
  }

  .facts a {
    color: var(--blue-ink);
  }

  .facts a:hover {
    text-decoration: underline;
  }

  .foot {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 18px 32px 24px;
    border-top: 1px solid var(--divider);
  }

  /* Phones: a bottom sheet with the actions at thumb height. */
  @media (max-width: 767px) {
    .pr-dialog {
      width: 100%;
      margin: auto 0 0;
    }

    .sheet {
      max-height: 88dvh;
      border-radius: 22px 22px 0 0;
      border-bottom: 0;
    }

    .foot {
      padding-bottom: max(20px, env(safe-area-inset-bottom));
    }

    .foot .btn {
      flex: 1;
    }

    h2 {
      font-size: 21px;
    }

    .head {
      padding: 18px 16px 0 22px;
    }

    .body {
      padding: 14px 22px 8px;
    }

    .desc {
      font-size: 15.5px;
    }

    .foot {
      padding-inline: 22px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pr-dialog[open] {
      animation: none;
    }
  }
</style>
