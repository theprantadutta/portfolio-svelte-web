<script lang="ts">
  import BlogCard from '$components/BlogCard.svelte'
  import SectionHeading from '$components/SectionHeading.svelte'
  import SectionMarker from '$components/SectionMarker.svelte'
  import SectionSubheading from '$components/SectionSubheading.svelte'
  import type { DevToArticle } from '$lib/types/blog-types'
  import BsArrowRight from '$icons/BsArrowRight.svelte'

  let { articles }: { articles: DevToArticle[] } = $props()
</script>

<section id="blog" class="section-spacing-sm scroll-mt-28">
  <SectionMarker section="Blogs" threshold={0.3} />
  <div class="mb-16 text-center">
    <SectionHeading>Popular Blog Posts</SectionHeading>
    <SectionSubheading>
      Writing on Flutter, backend, and lessons from building in production
    </SectionSubheading>
  </div>
  <div
    class="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
  >
    {#each articles as article (article.id)}
      <BlogCard {article} />
    {/each}
  </div>
  <div class="flex justify-center">
    <a
      href="/blogs"
      class="btn-primary special-border group relative mt-8 inline-block overflow-hidden px-5 py-2.5"
    >
      <span class="relative z-10 flex items-center gap-2">
        View All Posts
        <BsArrowRight
          class="transition-transform duration-300 group-hover:translate-x-1"
        />
      </span>
      <div
        class="animate-gradient from-primary-600 via-secondary-600 to-primary-600 absolute inset-0 bg-linear-to-r bg-size-[200%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      ></div>
    </a>
  </div>
</section>
