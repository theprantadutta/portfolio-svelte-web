<script lang="ts">
  import { fly } from 'svelte/transition'

  import { toast } from '$lib/toast.svelte'

  // Matches react-hot-toast's default top-right stack and card styling closely
  // enough to be indistinguishable in use.
</script>

<div
  class="pointer-events-none fixed top-4 right-4 z-9999 flex flex-col items-end gap-2"
  aria-live="polite"
  aria-atomic="false"
>
  {#each toast.toasts as t (t.id)}
    <div
      transition:fly={{ y: -12, duration: 200 }}
      class="pointer-events-auto flex max-w-sm items-start gap-3 rounded-lg bg-white px-4 py-3 text-sm text-gray-900 shadow-lg dark:bg-gray-800 dark:text-gray-100"
      role={t.kind === 'error' ? 'alert' : 'status'}
    >
      <span class="mt-0.5 shrink-0 text-base" aria-hidden="true">
        {t.kind === 'success' ? '✅' : '⛔'}
      </span>
      <span class="leading-snug">{t.message}</span>
      <button
        class="ml-2 shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
        onclick={() => toast.dismiss(t.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  {/each}
</div>
