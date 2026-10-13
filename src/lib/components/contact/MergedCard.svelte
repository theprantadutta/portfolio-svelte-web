<script lang="ts">
  import { profile } from '#lib/data/profile.js'

  interface Props {
    /** The visitor's PR title; absent on the no-JavaScript confirmation page. */
    title?: string
    onreset?: () => void
  }

  let { title, onreset }: Props = $props()
</script>

<!-- What the form collapses into once the message is sent. -->
<section class="card merged" aria-live="polite">
  <div class="head">
    <span class="badge">⇄ merged</span>
    <span class="refs">you/idea → pranta/inbox · just now</span>
  </div>
  <h2>Thanks, I'll reply within 24h.</h2>
  {#if title}
    <p class="title"><span class="muted">#</span> {title}</p>
  {/if}
  <p class="body">
    It's in the inbox. Replies come from <b>{profile.email}</b>, so keep an eye
    on your spam folder just in case.
  </p>
  {#if onreset}
    <button type="button" class="btn btn-outline" onclick={onreset}>
      open another <span class="arrow">→</span>
    </button>
  {:else}
    <a class="btn btn-outline" href="/"
      >$ git checkout main <span class="arrow">→</span></a
    >
  {/if}
</section>

<style>
  .merged {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 26px;
    border-radius: 20px;
  }

  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .badge {
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--purple);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    animation: badge-glow 1.2s var(--ease-out) 200ms 1 both;
  }

  @keyframes badge-glow {
    from {
      box-shadow: 0 0 0 0 color-mix(in oklch, var(--purple) 60%, transparent);
    }
    to {
      box-shadow: 0 0 0 12px color-mix(in oklch, var(--purple) 0%, transparent);
    }
  }

  .refs,
  .title {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-3);
  }

  h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.15;
  }

  .title {
    margin: 0;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--chip);
    color: var(--ink);
    overflow-wrap: anywhere;
  }

  .muted {
    color: var(--ink-4);
  }

  .body {
    margin: 0;
    max-width: 520px;
    font-size: 15.5px;
    line-height: 1.6;
    color: var(--ink-2);
  }

  @media (prefers-reduced-motion: reduce) {
    .badge {
      animation: none;
    }
  }
</style>
