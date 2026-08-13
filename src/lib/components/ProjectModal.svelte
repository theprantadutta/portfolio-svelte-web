<script lang="ts">
  import { onDestroy } from 'svelte'

  import StrapiImage from '$components/StrapiImage.svelte'
  import LoadingSpinners from '$components/ui/LoadingSpinners.svelte'
  import { ModalAnimation } from '$lib/modal-animation.svelte'
  import type { IStrapiImageData } from '$lib/types/types'
  import FaArrowLeft from '$icons/FaArrowLeft.svelte'
  import FaArrowRight from '$icons/FaArrowRight.svelte'
  import FaTimes from '$icons/FaTimes.svelte'

  interface Props {
    imageUrls: IStrapiImageData[]
    slug: string
  }

  let { imageUrls, slug }: Props = $props()

  let showModal = $state(false)
  let currentSlide = $state(0)
  let isLoading = $state(false)
  let modalEl = $state<HTMLDivElement | null>(null)

  const anim = new ModalAnimation()
  onDestroy(() => anim.destroy())

  $effect(() => {
    anim.set(showModal)
  })

  const handleClose = () => (showModal = false)

  $effect(() => {
    const html = document.querySelector('html')
    if (html) {
      html.style.overflow = showModal ? 'hidden' : 'auto'
    }

    if (!showModal) return

    const handleClickOutside = (event: MouseEvent) => {
      if (modalEl && !modalEl.contains(event.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  })

  const currentImage = $derived(imageUrls[currentSlide]?.formats.large)

  const nextSlide = () => {
    currentSlide = currentSlide === imageUrls.length - 1 ? 0 : currentSlide + 1
    isLoading = true
  }

  const prevSlide = () => {
    currentSlide = currentSlide === 0 ? imageUrls.length - 1 : currentSlide - 1
    isLoading = true
  }

  const goToSlide = (index: number) => {
    currentSlide = index
    isLoading = true
  }
</script>

<div
  class="project-action-buttons mt-5 flex flex-col justify-center gap-2 sm:flex-row"
>
  <a
    class="btn-primary special-border px-6 py-2 text-center text-sm font-medium"
    href="/projects/{slug}"
  >
    Show Detail
  </a>
  <button
    class="btn-secondary special-border px-6 py-2 text-center text-sm font-medium"
    type="button"
    onclick={() => {
      showModal = true
      isLoading = true
    }}
  >
    Screenshots
  </button>
</div>

{#if anim.shouldRender && currentImage}
  <div
    class="{anim.overlayClassName} flex flex-col items-center justify-center p-4 backdrop-blur-md"
  >
    <div
      bind:this={modalEl}
      class={anim.modalClassName(
        'relative mx-auto max-h-full w-full max-w-4xl'
      )}
    >
      <div
        class="glass-card special-border relative overflow-hidden border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80"
      >
        <!-- Enhanced gradient background -->
        <div
          class="from-primary-500/10 via-secondary-500/10 to-accent-500/10 dark:from-primary-500/5 dark:via-secondary-500/5 dark:to-accent-500/5 absolute inset-0 bg-linear-to-br"
        ></div>

        <!-- Close Button -->
        <button
          class="special-border glass-card group absolute top-4 right-4 z-40 flex h-10 w-10 items-center justify-center border-white/20 transition-all duration-300 hover:bg-red-500/20 dark:border-white/10"
          onclick={handleClose}
          aria-label="Close screenshots"
        >
          <FaTimes
            class="h-4 w-4 text-gray-700 transition-colors duration-300 group-hover:text-red-500 dark:text-gray-300"
          />
        </button>

        <!-- Carousel -->
        <div class="relative w-full">
          <!-- Carousel wrapper -->
          <div
            class="special-border relative h-[80vh] max-h-screen overflow-hidden"
          >
            {#if isLoading}
              <div
                class="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs"
              >
                <div class="glass-card special-border p-6">
                  <LoadingSpinners
                    size="lg"
                    color="white"
                    outerCircleColor="text-primary-500"
                    innerCircleColor="text-secondary-500"
                    barColor="text-primary-400"
                  />
                  <p class="mt-3 text-center text-sm text-white">Loading...</p>
                </div>
              </div>
            {/if}

            <div
              class="h-full w-full transition-all duration-500 ease-out {isLoading
                ? 'scale-95 opacity-0'
                : 'scale-100 opacity-100'}"
            >
              {#key currentSlide}
                <StrapiImage
                  height={500}
                  width={500}
                  src={currentImage.url}
                  class="absolute top-1/2 left-1/2 block max-h-full max-w-full -translate-x-1/2 -translate-y-1/2 object-contain"
                  alt="Project screenshot"
                  priority
                  onload={() => (isLoading = false)}
                />
              {/key}
            </div>
          </div>

          <!-- Slider controls -->
          <button
            type="button"
            class="special-border glass-card group absolute start-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center border-white/20 transition-all duration-300 hover:bg-white/20 dark:border-white/10"
            onclick={prevSlide}
            aria-label="Previous screenshot"
          >
            <FaArrowLeft
              class="h-4 w-4 text-gray-700 transition-colors duration-300 group-hover:text-white dark:text-gray-300"
            />
          </button>

          <button
            type="button"
            class="special-border glass-card group absolute end-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center border-white/20 transition-all duration-300 hover:bg-white/20 dark:border-white/10"
            onclick={nextSlide}
            aria-label="Next screenshot"
          >
            <FaArrowRight
              class="h-4 w-4 text-gray-700 transition-colors duration-300 group-hover:text-white dark:text-gray-300"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Slider indicators - outside the modal card -->
    <div class="mt-6 flex space-x-3">
      {#each imageUrls as _, i (i)}
        <button
          type="button"
          class="h-3 w-3 rounded-full transition-all duration-300 {currentSlide ===
          i
            ? 'scale-125 bg-white shadow-lg'
            : 'bg-white/50 hover:scale-110 hover:bg-white/75'}"
          aria-label="Slide {i + 1}"
          onclick={() => goToSlide(i)}
        ></button>
      {/each}
    </div>
  </div>
{/if}
