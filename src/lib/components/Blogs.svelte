<script lang="ts">
  import BlogCard from '$components/BlogCard.svelte'
  import SectionHeading from '$components/SectionHeading.svelte'
  import SectionMarker from '$components/SectionMarker.svelte'
  import type { DevToArticle } from '$lib/types/blog-types'

  let { articles }: { articles: DevToArticle[] } = $props()
</script>

<section id="blogs" class="section-spacing-sm scroll-mt-28">
  <SectionMarker section="Blogs" threshold={0.3} />
  <SectionHeading>My Blogs</SectionHeading>
  <div
    class="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
  >
    {#each articles as article (article.id)}
      <BlogCard {article} />
    {/each}
  </div>
</section>
