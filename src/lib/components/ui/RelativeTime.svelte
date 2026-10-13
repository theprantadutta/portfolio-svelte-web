<script lang="ts">
  import { onMount } from 'svelte'

  let { date }: { date: string } = $props()

  /**
   * "2 days ago" for a date. The prerendered page can only know the build
   * date, so it prints the absolute date and the browser swaps in the
   * relative wording once it knows what today is.
   */
  const absolute = $derived(
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    })
  )

  let relative = $state<string | null>(null)

  onMount(() => {
    const days = Math.floor(
      (Date.now() - new Date(date).getTime()) / 86_400_000
    )
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    if (days < 1) relative = 'today'
    else if (days < 30) relative = rtf.format(-days, 'day')
    else if (days < 365) relative = rtf.format(-Math.floor(days / 30), 'month')
    else relative = rtf.format(-Math.floor(days / 365), 'year')
  })
</script>

<time datetime={date} title={absolute}>{relative ?? absolute}</time>
