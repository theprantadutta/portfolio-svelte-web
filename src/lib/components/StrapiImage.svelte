<script lang="ts">
  import { getStrapiMedia } from '$lib/constants/urls'
  import type { IStrapiImageData } from '$lib/types/types'

  /**
   * Replacement for the `next/image` + `StrapiImage` pair.
   *
   * Next optimised Strapi media at request time by proxying it through
   * /_next/image. There is no such proxy on a prerendered site, and there
   * doesn't need to be: Strapi already derives thumbnail/small/medium/large
   * variants for every upload and reports their exact URLs and pixel
   * dimensions. Passing `formats` turns those into a real `srcset`, so the
   * browser downloads the variant that fits the slot and fetches it straight
   * from Strapi — one hop instead of two, and no image encoding on our server.
   */
  interface Props {
    src: string
    alt: string
    width: number
    height: number
    /** Strapi's `formats` object. Supplying it enables the srcset. */
    formats?: IStrapiImageData['formats']
    class?: string
    objectFit?: string
    /** Eager-load and raise fetch priority — the `priority` prop in next/image. */
    priority?: boolean
    sizes?: string
    /** Absolutely fill the nearest positioned ancestor, like next/image's `fill`. */
    fill?: boolean
    onload?: (event: Event) => void
  }

  let {
    src,
    alt,
    width,
    height,
    formats,
    class: className = '',
    objectFit = 'contain',
    priority = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    fill = false,
    onload,
  }: Props = $props()

  let errored = $state(false)

  const fallback = $derived(`https://placehold.co/${width}x${height}`)
  const resolved = $derived(getStrapiMedia(src))
  const finalSrc = $derived(errored ? fallback : resolved || fallback)

  // Every distinct variant Strapi produced, smallest first. Deduped by width so
  // an upload smaller than a breakpoint (where Strapi reuses one file for two
  // format keys) doesn't emit a duplicate candidate.
  const srcset = $derived.by(() => {
    if (!formats || errored) return undefined

    const candidates = [
      formats.thumbnail,
      formats.small,
      formats.medium,
      formats.large,
    ]
      .filter((f) => f?.url && f?.width)
      .sort((a, b) => a.width - b.width)
      .filter((f, i, all) => i === 0 || f.width !== all[i - 1].width)
      .map((f) => `${getStrapiMedia(f.url)} ${f.width}w`)

    return candidates.length > 1 ? candidates.join(', ') : undefined
  })

  const style = $derived(
    [
      `object-fit:${objectFit}`,
      'max-height:100%',
      'max-width:100%',
      fill ? 'position:absolute;inset:0;width:100%;height:100%' : '',
    ]
      .filter(Boolean)
      .join(';')
  )
</script>

{#if src}
  <img
    src={finalSrc}
    {srcset}
    sizes={srcset ? sizes : undefined}
    {alt}
    width={fill ? undefined : width}
    height={fill ? undefined : height}
    class={className}
    {style}
    loading={priority ? 'eager' : 'lazy'}
    fetchpriority={priority ? 'high' : 'auto'}
    decoding="async"
    {onload}
    onerror={() => (errored = true)}
  />
{/if}
