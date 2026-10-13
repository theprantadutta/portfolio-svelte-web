<script lang="ts">
  import type { ImageRef } from '#lib/projects.js'

  interface Props {
    slug: string
    title: string
    image: ImageRef
  }

  let { slug, title, image }: Props = $props()
</script>

<!--
  The project's Google Play feature graphic (1024 × 500), as the banner at
  the top of the overview. It shares a view-transition name with the pinned
  card's panel, so it morphs between the list and the page.
-->
<figure class="feature" style:view-transition-name="project-shot-{slug}">
  <img
    src={image.url}
    srcset={image.srcset}
    sizes="(max-width: 1023px) 92vw, 760px"
    alt="{title} feature graphic"
    width={image.width}
    height={image.height}
    fetchpriority="high"
    decoding="async"
  />
</figure>

<style>
  .feature {
    margin: 0;
    overflow: hidden;
    aspect-ratio: 1024 / 500;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--surface-muted);
    box-shadow: 0 24px 48px -32px rgb(0 0 0 / 0.35);
  }

  .feature img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 767px) {
    .feature {
      border-radius: 16px;
    }
  }
</style>
