<script lang="ts">
  import { onDestroy } from 'svelte'

  import StrapiImage from '$components/StrapiImage.svelte'
  import { ModalAnimation } from '$lib/modal-animation.svelte'
  import { getOptimalImageSrc } from '$lib/project-utils'
  import type { IStrapiImageData } from '$lib/types/types'
  import FaArrowLeft from '$icons/FaArrowLeft.svelte'
  import FaArrowRight from '$icons/FaArrowRight.svelte'
  import FaChevronLeft from '$icons/FaChevronLeft.svelte'
  import FaChevronRight from '$icons/FaChevronRight.svelte'
  import FaExpand from '$icons/FaExpand.svelte'
  import FaImage from '$icons/FaImage.svelte'
  import FaInfoCircle from '$icons/FaInfoCircle.svelte'
  import FaPlay from '$icons/FaPlay.svelte'
  import FaTimes from '$icons/FaTimes.svelte'
  import FaVideo from '$icons/FaVideo.svelte'

  // Extended media type that can be image or video
  interface MediaItem extends IStrapiImageData {
    isVideo?: boolean
    url?: string
  }

  interface Props {
    images: IStrapiImageData[]
    videos?: IStrapiImageData[]
    projectTitle: string
    selectedIndex: number
    onIndexChange: (index: number) => void
  }

  let { images, videos, projectTitle, selectedIndex, onIndexChange }: Props =
    $props()

  let showFullscreen = $state(false)
  let showImageInfo = $state(false)
  let canScrollLeft = $state(false)
  let canScrollRight = $state(false)
  let thumbnailEl = $state<HTMLDivElement | null>(null)

  const anim = new ModalAnimation()
  onDestroy(() => anim.destroy())

  $effect(() => {
    anim.set(showFullscreen)
  })

  // Videos first, then images — a single ordered media array.
  const allMedia = $derived<MediaItem[]>([
    ...(videos || []).map((v) => ({ ...v, isVideo: true })),
    ...images.map((img) => ({ ...img, isVideo: false })),
  ])

  const currentMedia = $derived(allMedia[selectedIndex])
  const isCurrentVideo = $derived(currentMedia?.isVideo || false)
  const videoCount = $derived(videos?.length || 0)
  const imageCount = $derived(images.length)

  // Helper to get video URL from Strapi media
  const getVideoUrl = (media: MediaItem): string => {
    if (media.url) return media.url
    if (media.formats?.large?.url) return media.formats.large.url
    if (media.formats?.medium?.url) return media.formats.medium.url
    return ''
  }

  const checkScrollability = () => {
    if (!thumbnailEl) return
    const { scrollLeft, scrollWidth, clientWidth } = thumbnailEl
    canScrollLeft = scrollLeft > 0
    canScrollRight = scrollLeft < scrollWidth - clientWidth - 5
  }

  $effect(() => {
    // Re-measure when the media list changes, and whenever the strip scrolls
    // or the viewport resizes.
    void allMedia.length
    checkScrollability()

    const container = thumbnailEl
    if (!container) return

    container.addEventListener('scroll', checkScrollability)
    window.addEventListener('resize', checkScrollability)
    return () => {
      container.removeEventListener('scroll', checkScrollability)
      window.removeEventListener('resize', checkScrollability)
    }
  })

  const scrollThumbnails = (direction: 'left' | 'right') => {
    thumbnailEl?.scrollBy({
      left: direction === 'left' ? -150 : 150,
      behavior: 'smooth',
    })
  }

  const nextImage = () => {
    onIndexChange(selectedIndex === allMedia.length - 1 ? 0 : selectedIndex + 1)
  }

  const prevImage = () => {
    onIndexChange(selectedIndex === 0 ? allMedia.length - 1 : selectedIndex - 1)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showFullscreen) return

    switch (e.key) {
      case 'Escape':
        showFullscreen = false
        break
      case 'ArrowLeft':
        prevImage()
        break
      case 'ArrowRight':
        nextImage()
        break
      case 'i':
      case 'I':
        showImageInfo = !showImageInfo
        break
    }
  }

  $effect(() => {
    document.body.style.overflow = showFullscreen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  })

  const getMediaDimensions = (media: MediaItem) => {
    const medium = media?.formats?.medium
    const large = media?.formats?.large
    const width = medium?.width || large?.width || 400
    const height = medium?.height || large?.height || 600
    return { width, height, aspectRatio: width / height }
  }

  const dims = $derived(getMediaDimensions(currentMedia))
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- Gallery Header with Enhanced Stats -->
<div class="mb-6 text-center sm:mb-8">
  <div
    class="special-border glass-card inline-flex flex-wrap items-center justify-center gap-2 bg-white/10 px-3 py-2 backdrop-blur-xl sm:gap-4 sm:px-6 sm:py-3 dark:bg-gray-900/30"
  >
    <div class="flex items-center gap-2">
      <FaImage class="text-primary-500 h-3 w-3 sm:h-4 sm:w-4" />
      <span
        class="text-sm font-medium text-gray-900 sm:text-base dark:text-white"
      >
        {imageCount} Screenshots
      </span>
    </div>
    {#if videoCount > 0}
      <div class="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-600"></div>
      <div class="flex items-center gap-2">
        <FaVideo class="text-secondary-500 h-3 w-3 sm:h-4 sm:w-4" />
        <span
          class="text-sm font-medium text-gray-900 sm:text-base dark:text-white"
        >
          {videoCount} Video{videoCount > 1 ? 's' : ''}
        </span>
      </div>
    {/if}
    <div class="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-600"></div>
    <div class="flex items-center gap-2">
      <span class="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
        Current: {selectedIndex + 1}/{allMedia.length}
      </span>
    </div>
    {#if !isCurrentVideo}
      <div class="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-600"></div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
          {dims.width}×{dims.height}
        </span>
      </div>
    {/if}
  </div>
</div>

<!-- Main Image Display with Enhanced Container -->
<div class="relative mb-6 px-4 sm:mb-8 sm:px-8">
  <div class="relative mx-auto aspect-9/16 w-full max-w-[280px] sm:max-w-sm">
    <!-- Enhanced Glow Effects -->
    <div
      class="from-primary-500/30 via-secondary-500/20 to-accent-500/30 absolute -inset-8 bg-linear-to-br blur-2xl"
    ></div>
    <div
      class="from-primary-400/20 via-secondary-400/15 to-accent-400/20 absolute -inset-4 bg-linear-to-br blur-xl"
    ></div>

    <!-- Enhanced Glassmorphic Container -->
    <div
      class="special-border glass-card relative h-full overflow-hidden border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/30"
    >
      <div class="relative h-full w-full overflow-hidden rounded-lg">
        {#if isCurrentVideo}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            src={getVideoUrl(currentMedia)}
            class="h-full w-full object-cover"
            controls
            playsinline
          ></video>
        {:else}
          <StrapiImage
            src={getOptimalImageSrc(currentMedia, 'gallery')}
            formats={currentMedia?.formats}
            alt="{projectTitle} screenshot {selectedIndex + 1}"
            class="h-full w-full object-cover transition-all duration-300"
            width={280}
            height={560}
            sizes="(max-width: 640px) 280px, 384px"
          />
        {/if}

        <!-- Media Overlay Actions -->
        <div class="absolute top-2 right-2 flex gap-2">
          <button
            onclick={() => (showFullscreen = true)}
            class="special-border glass-card p-2 text-white/90 transition-all duration-300 hover:bg-white/20"
            aria-label="View fullscreen"
          >
            <FaExpand class="h-4 w-4" />
          </button>
          {#if !isCurrentVideo}
            <button
              onclick={() => (showImageInfo = !showImageInfo)}
              class="special-border glass-card p-2 text-white/90 transition-all duration-300 hover:bg-white/20"
              aria-label={showImageInfo ? 'Hide image info' : 'Show image info'}
            >
              <FaInfoCircle class="h-4 w-4" />
            </button>
          {/if}
        </div>

        <!-- Video Badge -->
        {#if isCurrentVideo}
          <div class="absolute top-2 left-2">
            <div
              class="special-border glass-card bg-secondary-500/80 flex items-center gap-1 px-2 py-1 text-white"
            >
              <FaVideo class="h-3 w-3" />
              <span class="text-xs font-medium">Video</span>
            </div>
          </div>
        {/if}

        <!-- Image Info Overlay -->
        {#if showImageInfo && !isCurrentVideo}
          <div
            class="absolute right-0 bottom-0 left-0 bg-black/80 p-3 text-white backdrop-blur-xs"
          >
            <div class="space-y-1 text-xs">
              <div>Dimensions: {dims.width} × {dims.height}</div>
              <div>Aspect Ratio: {dims.aspectRatio.toFixed(2)}</div>
              <div>Item {selectedIndex + 1} of {allMedia.length}</div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Enhanced Navigation Buttons -->
    {#if allMedia.length > 1}
      <button
        onclick={prevImage}
        class="special-border glass-card absolute top-1/2 -left-4 z-20 -translate-y-1/2 p-2 transition-all duration-300 hover:scale-110 hover:bg-white/30 sm:-left-6 sm:p-3 dark:hover:bg-gray-800/50"
        aria-label="Previous image"
      >
        <FaArrowLeft class="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        onclick={nextImage}
        class="special-border glass-card absolute top-1/2 -right-4 z-20 -translate-y-1/2 p-2 transition-all duration-300 hover:scale-110 hover:bg-white/30 sm:-right-6 sm:p-3 dark:hover:bg-gray-800/50"
        aria-label="Next image"
      >
        <FaArrowRight class="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    {/if}

    <!-- Enhanced Counter -->
    <div
      class="special-border glass-card absolute bottom-2 left-1/2 z-20 -translate-x-1/2 bg-black/50 px-3 py-1 backdrop-blur-md sm:bottom-4 sm:px-4 sm:py-2"
    >
      <span class="text-xs font-medium text-white sm:text-sm">
        {selectedIndex + 1} / {allMedia.length}
      </span>
    </div>
  </div>
</div>

<!-- Thumbnail Navigation with Arrows -->
<div class="relative mx-auto max-w-2xl px-12">
  <!-- Left Arrow -->
  {#if canScrollLeft}
    <button
      onclick={() => scrollThumbnails('left')}
      class="absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800"
      aria-label="Scroll thumbnails left"
    >
      <FaChevronLeft class="h-4 w-4" />
    </button>
  {/if}

  <!-- Right Arrow -->
  {#if canScrollRight}
    <button
      onclick={() => scrollThumbnails('right')}
      class="absolute top-1/2 right-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800"
      aria-label="Scroll thumbnails right"
    >
      <FaChevronRight class="h-4 w-4" />
    </button>
  {/if}

  <!-- Thumbnails Container -->
  <div
    bind:this={thumbnailEl}
    class="flex gap-2 overflow-x-auto py-2"
    style="scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch;"
  >
    {#each allMedia as media, index (media.id)}
      <button
        onclick={() => onIndexChange(index)}
        aria-label="View {media.isVideo ? 'video' : 'image'} {index +
          1} of {allMedia.length}"
        class="relative shrink-0 overflow-hidden rounded-lg transition-all duration-200 {selectedIndex ===
        index
          ? 'ring-primary-500 ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900'
          : 'opacity-60 hover:opacity-100'}"
      >
        <div class="h-16 w-16 sm:h-[72px] sm:w-[72px]">
          {#if media.isVideo}
            <div
              class="flex h-full w-full items-center justify-center bg-gray-800"
            >
              <FaPlay class="h-4 w-4 text-white" />
            </div>
          {:else}
            <StrapiImage
              src={getOptimalImageSrc(media, 'thumbnail')}
              alt="{projectTitle} thumbnail {index + 1}"
              class="h-full w-full object-cover"
              width={72}
              height={72}
            />
          {/if}
        </div>
        <!-- Video indicator overlay -->
        {#if media.isVideo}
          <div
            class="bg-secondary-500/80 absolute right-0 bottom-0 left-0 py-0.5 text-center"
          >
            <span class="text-[8px] font-medium text-white">VIDEO</span>
          </div>
        {/if}
      </button>
    {/each}
  </div>
</div>

<!-- Fullscreen Modal -->
{#if anim.shouldRender}
  {@const entered =
    anim.animationPhase === 'entering' || anim.animationPhase === 'entered'}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-xs transition-all duration-300 {entered
      ? 'opacity-100'
      : 'opacity-0'}"
    onclick={() => (showFullscreen = false)}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="relative max-h-[90vh] max-w-[90vw] transition-all duration-300 {entered
        ? 'scale-100'
        : 'scale-95'}"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Fullscreen Media -->
      {#if isCurrentVideo}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video
          src={getVideoUrl(currentMedia)}
          class="max-h-[90vh] max-w-[90vw] object-contain"
          controls
          autoplay
          playsinline
        ></video>
      {:else}
        <StrapiImage
          src={getOptimalImageSrc(currentMedia, 'hero')}
          formats={currentMedia?.formats}
          alt="{projectTitle} screenshot {selectedIndex + 1}"
          class="max-h-[90vh] max-w-[90vw] object-contain"
          width={dims.width}
          height={dims.height}
          sizes="90vw"
          priority
        />
      {/if}

      <!-- Fullscreen Controls -->
      <div class="absolute top-4 right-4 flex gap-2">
        {#if !isCurrentVideo}
          <button
            onclick={() => (showImageInfo = !showImageInfo)}
            class="special-border glass-card p-3 text-white transition-all duration-300 hover:bg-white/20"
            aria-label={showImageInfo ? 'Hide image info' : 'Show image info'}
          >
            <FaInfoCircle class="h-5 w-5" />
          </button>
        {/if}
        <button
          onclick={() => (showFullscreen = false)}
          class="special-border glass-card p-3 text-white transition-all duration-300 hover:bg-white/20"
          aria-label="Close fullscreen"
        >
          <FaTimes class="h-5 w-5" />
        </button>
      </div>

      <!-- Fullscreen Navigation -->
      {#if allMedia.length > 1}
        <button
          onclick={prevImage}
          class="special-border glass-card absolute top-1/2 left-4 -translate-y-1/2 p-4 text-white transition-all duration-300 hover:bg-white/20"
          aria-label="Previous image"
        >
          <FaArrowLeft class="h-6 w-6" />
        </button>
        <button
          onclick={nextImage}
          class="special-border glass-card absolute top-1/2 right-4 -translate-y-1/2 p-4 text-white transition-all duration-300 hover:bg-white/20"
          aria-label="Next image"
        >
          <FaArrowRight class="h-6 w-6" />
        </button>
      {/if}

      <!-- Fullscreen Info Panel (images only) -->
      {#if showImageInfo && !isCurrentVideo}
        <div
          class="absolute right-4 bottom-4 left-4 rounded-lg bg-black/80 p-4 text-white backdrop-blur-xs"
        >
          <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <div class="font-medium">Dimensions</div>
              <div class="text-gray-300">{dims.width} × {dims.height}</div>
            </div>
            <div>
              <div class="font-medium">Aspect Ratio</div>
              <div class="text-gray-300">{dims.aspectRatio.toFixed(2)}</div>
            </div>
            <div>
              <div class="font-medium">Position</div>
              <div class="text-gray-300">
                {selectedIndex + 1} of {allMedia.length}
              </div>
            </div>
            <div>
              <div class="font-medium">Controls</div>
              <div class="text-gray-300">← → ESC I</div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Fullscreen Counter -->
      <div
        class="special-border glass-card absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 text-white backdrop-blur-md"
      >
        {selectedIndex + 1} / {allMedia.length}
      </div>
    </div>
  </div>
{/if}
