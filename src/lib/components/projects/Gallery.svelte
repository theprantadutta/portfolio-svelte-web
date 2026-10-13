<script lang="ts">
  import Phone from '#components/projects/Phone.svelte'
  import type { ImageRef } from '#lib/projects.js'

  interface Props {
    slug: string
    title: string
    screenshots: ImageRef[]
  }

  let { slug, title, screenshots }: Props = $props()

  /**
   * Three phones on the accent gradient, the first screenshot in the middle
   * and larger (README §04). Only real screenshots are shown: a project with
   * one or two gets one or two phones, never a placeholder.
   */
  const shots = $derived.by(() => {
    const [first, second, third] = screenshots
    if (!first) return []
    if (!second) return [{ image: first, center: true }]
    if (!third)
      return [
        { image: first, center: true },
        { image: second, center: false },
      ]
    return [
      { image: second, center: false },
      { image: first, center: true },
      { image: third, center: false },
    ]
  })
</script>

{#if shots.length}
  <div class="gallery" aria-label="{title} screenshots">
    {#each shots as shot, i (i)}
      <Phone
        image={shot.image}
        alt="{title} screenshot {i + 1}"
        width={shot.center ? 200 : 170}
        transitionName={shot.center ? `project-shot-${slug}` : undefined}
        priority={shot.center}
        class={shot.center ? 'center' : 'side'}
      />
    {/each}
  </div>
{/if}

<style>
  /* Phones hang from the top so each app's header shows, and the panel's
     bottom edge crops the long screenshots. */
  .gallery {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 18px;
    height: 380px;
    padding: 28px 28px 0;
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: linear-gradient(160deg, var(--panel-a), var(--panel-b));
  }

  .gallery :global(.side) {
    margin-top: 34px;
  }

  @media (max-width: 767px) {
    .gallery {
      height: 280px;
      gap: 10px;
      padding: 20px 14px 0;
    }

    .gallery :global(.center) {
      width: 150px !important;
    }

    .gallery :global(.side) {
      width: 118px !important;
      border-width: 4px;
    }
  }
</style>
