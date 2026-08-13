<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
</script>

<p
  class="mx-auto mt-4 max-w-2xl text-base text-balance text-gray-600 sm:text-lg dark:text-gray-400"
>
  {@render children()}
</p>
