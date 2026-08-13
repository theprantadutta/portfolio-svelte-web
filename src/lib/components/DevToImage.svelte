<script lang="ts">
  /**
   * Cover images for dev.to articles.
   *
   * dev.to serves covers through its own imaging CDN, and the URL already
   * encodes the transform:
   *
   *   https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,
   *     gravity=auto,format=auto/https%3A%2F%2F...
   *
   * `format=auto` means the CDN already negotiates AVIF/WebP per request, so
   * running these through an optimiser of our own would add a hop and gain
   * nothing. What Next's proxy *did* add was a srcset; we get that back by
   * rewriting the `width=`/`height=` pair, which keeps the CDN doing the work
   * and costs us zero bytes of runtime code.
   */
  interface Props {
    src: string
    alt: string
    /** Intrinsic width the URL is authored at; used to derive the srcset. */
    width?: number
    height?: number
    class?: string
    priority?: boolean
    sizes?: string
    fill?: boolean
  }

  let {
    src,
    alt,
    width = 1000,
    height = 420,
    class: className = '',
    priority = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    fill = false,
  }: Props = $props()

  const WIDTHS = [400, 640, 800, 1000, 1400]

  const isDynamic = $derived(/\/dynamic\/image\/[^/]*width=\d+/.test(src))

  const aspect = $derived(height > 0 ? width / height : 1000 / 420)

  const srcset = $derived.by(() => {
    if (!isDynamic) return undefined

    return WIDTHS.map((w) => {
      const h = Math.round(w / aspect)
      const rewritten = src
        .replace(/width=\d+/, `width=${w}`)
        .replace(/height=\d+/, `height=${h}`)
      return `${rewritten} ${w}w`
    }).join(', ')
  })

  const style = $derived(
    fill ? 'position:absolute;inset:0;width:100%;height:100%' : ''
  )
</script>

<img
  {src}
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
/>
