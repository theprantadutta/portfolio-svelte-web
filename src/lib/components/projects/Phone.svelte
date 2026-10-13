<script lang="ts">
  import type { ImageRef } from '#lib/projects.js'

  interface Props {
    image: ImageRef
    alt: string
    /** Rendered width in px; height follows the screenshot. */
    width: number
    /** Shared-element name, so the shot morphs between list and detail. */
    transitionName?: string
    priority?: boolean
    class?: string
  }

  let {
    image,
    alt,
    width,
    transitionName,
    priority = false,
    class: className = '',
  }: Props = $props()
</script>

<!--
  A phone's top half: the screenshot inside a dark bezel with no bottom
  edge, so it reads as rising out of the panel behind it.
-->
<div
  class="phone {className}"
  style:width="{width}px"
  style:view-transition-name={transitionName}
>
  <img
    src={image.url}
    srcset={image.srcset}
    sizes="{width}px"
    {alt}
    width={image.width}
    height={image.height}
    loading={priority ? 'eager' : 'lazy'}
    fetchpriority={priority ? 'high' : 'auto'}
    decoding="async"
  />
</div>

<style>
  .phone {
    flex: none;
    max-width: 100%;
    overflow: hidden;
    border: 6px solid var(--ink);
    border-bottom: 0;
    border-radius: 24px 24px 0 0;
    background: var(--ink);
    box-shadow: var(--shadow-photo);
  }

  :global([data-theme='dark']) .phone {
    border-color: #050608;
    background: #050608;
  }

  img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 18px 18px 0 0;
  }
</style>
