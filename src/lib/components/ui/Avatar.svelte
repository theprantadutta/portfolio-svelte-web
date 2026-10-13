<script lang="ts">
  // Cropped from the original illustration (profile_studio_gibli.png) the way
  // the design frames it. The widths cover every size it renders at (28px in
  // a post byline up to 96px in the README) at 1x and 2x.
  import avatar from '$lib/assets/avatar.png?w=192;96;64;32&enhanced'

  interface Props {
    size: number
    /** Corner radius; the README uses a rounded square instead of a circle. */
    radius?: string
    class?: string
    /** Keeps the nav avatar in place across route transitions. */
    transitionName?: string
    priority?: boolean
  }

  let {
    size,
    radius = '50%',
    class: className = '',
    transitionName,
    priority = false,
  }: Props = $props()
</script>

<enhanced:img
  src={avatar}
  alt=""
  sizes="{size}px"
  class="avatar {className}"
  style:width="{size}px"
  style:height="{size}px"
  style:border-radius={radius}
  style:view-transition-name={transitionName}
  loading={priority ? 'eager' : 'lazy'}
  fetchpriority={priority ? 'high' : 'auto'}
/>

<style>
  :global(img.avatar) {
    flex: none;
    object-fit: cover;
    background: var(--chip);
  }
</style>
