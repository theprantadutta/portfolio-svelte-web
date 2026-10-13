<script lang="ts">
  import Mail from '@lucide/svelte/icons/mail'

  import { BRAND_ICONS, type BrandName } from '#lib/brand-icons.js'

  let { name, size = 18 }: { name: BrandName; size?: number } = $props()

  // Drawn in the current text colour so every mark follows the theme. Email
  // is not a brand, so it stays a Lucide icon like the rest of the site.
  const brand = $derived(name === 'email' ? null : BRAND_ICONS[name].icon)
</script>

{#if brand}
  {@const [width, height, , , path] = brand}
  <svg
    width={size}
    height={size}
    viewBox="0 0 {width} {height}"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={typeof path === 'string' ? path : path.join(' ')} />
  </svg>
{:else}
  <Mail {size} strokeWidth={1.75} aria-hidden="true" />
{/if}
