<script lang="ts">
  import FaPaperPlane from '$icons/FaPaperPlane.svelte'

  // `pending` came from React's useFormStatus; here the parent form owns the
  // submitting flag and passes it down.
  let { pending = false }: { pending?: boolean } = $props()
</script>

<button
  type="submit"
  class="btn-primary special-border group relative overflow-hidden px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-65"
  disabled={pending}
>
  <span class="relative z-10 flex items-center gap-2">
    {#if pending}
      Sending...
      <div
        class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
      ></div>
    {:else}
      Submit
      <FaPaperPlane
        class="transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
      />
    {/if}
  </span>

  <!-- Animated background -->
  {#if !pending}
    <div
      class="animate-gradient from-primary-600 via-secondary-600 to-primary-600 absolute inset-0 bg-linear-to-r bg-size-[200%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    ></div>
  {/if}
</button>
