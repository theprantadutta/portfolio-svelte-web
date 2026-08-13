<script lang="ts">
  import { browser } from '$app/environment'

  /**
   * The theme switch is the one component that genuinely cannot render on the
   * server: its icon depends on the stored theme, which only exists in the
   * browser, so prerendering it would bake in whichever icon the build machine
   * happened to imply and then visibly swap after hydration.
   *
   * Under Next this was `dynamic(..., { ssr: false })`. Here it is an ordinary
   * dynamic import behind a `browser` guard, which keeps the component out of
   * the prerendered HTML *and* out of the initial JS payload — the chunk is
   * only requested once the page is interactive.
   */
  const load = () => import('./ThemeSwitch.svelte').then((m) => m.default)
</script>

{#if browser}
  {#await load() then ThemeSwitch}
    <ThemeSwitch />
  {/await}
{/if}
