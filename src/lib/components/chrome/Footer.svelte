<script lang="ts">
  import { profile } from '#lib/data/profile.js'

  // Evaluated during prerender, so the year is baked in at build time. The
  // first deploy of a new year refreshes it.
  const year = new Date().getFullYear()
</script>

<footer class="container-page">
  <div class="inner">
    <small>&copy; {year} {profile.name}. All rights reserved.</small>
    <p>
      Built with SvelteKit, Tailwind CSS, Strapi and <span class="ai">AI</span
      >&nbsp;✨
    </p>
  </div>
</footer>

<style>
  .inner {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-block: 22px 28px;
    border-top: 1px solid var(--divider);
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
    color: var(--ink-3);
  }

  small {
    font-size: inherit;
  }

  p {
    margin: 0;
    text-wrap: balance;
  }

  .ai {
    background-image: var(--grad-signature);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: 700;
  }
</style>
