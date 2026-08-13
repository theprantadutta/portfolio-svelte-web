<script lang="ts">
  // Evaluated during prerender, so the year is baked at build time — same as
  // the Next server component. A deploy in the new year refreshes it.
  const year = new Date().getFullYear()
</script>

<small class="mb-2 block text-xs">
  &copy; {year} Pranta Dutta. All rights reserved.
</small>
