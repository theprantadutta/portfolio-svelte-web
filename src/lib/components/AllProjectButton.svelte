<script lang="ts">
  import BsArrowRight from '$icons/BsArrowRight.svelte'
</script>

<div class="flex justify-center">
  <a
    href="/projects"
    class="btn-primary special-border group relative mt-5 inline-block overflow-hidden px-5 py-2.5"
  >
    <span class="relative z-10 flex items-center gap-2">
      All Projects
      <BsArrowRight
        class="transition-transform duration-300 group-hover:translate-x-1"
      />
    </span>

    <!-- Animated background -->
    <div
      class="animate-gradient from-primary-600 via-secondary-600 to-primary-600 absolute inset-0 bg-linear-to-r bg-size-[200%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    ></div>
  </a>
</div>
