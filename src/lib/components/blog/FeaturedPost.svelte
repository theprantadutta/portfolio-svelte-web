<script lang="ts">
  import DevToImage from '#components/DevToImage.svelte'
  import { spotlight } from '#lib/motion/pointer.js'
  import { postDate, type PostSummary } from './posts'

  let { post }: { post: PostSummary } = $props()
</script>

<a class="card featured lift spotlight" href="/blogs/{post.slug}" use:spotlight>
  <div class="cover" style:view-transition-name="post-cover-{post.slug}">
    <DevToImage
      src={post.cover}
      alt=""
      fill
      priority
      class="object-cover"
      sizes="(max-width: 1023px) 100vw, 650px"
    />
  </div>
  <div class="body">
    <p class="meta">
      <span class="latest">latest</span> · {post.hash} · {postDate(
        post.publishedAt
      )}
      · {post.minutes} min read
    </p>
    <h2 class="title" style:view-transition-name="post-title-{post.slug}">
      {post.title}
    </h2>
    {#if post.description}
      <p class="excerpt">{post.description}</p>
    {/if}
    {#if post.tags.length}
      <ul class="tags" aria-label="Tags">
        {#each post.tags.slice(0, 3) as tag (tag)}
          <li class="chip">#{tag}</li>
        {/each}
      </ul>
    {/if}
  </div>
</a>

<style>
  .featured {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 20px;
  }

  .cover {
    position: relative;
    height: 290px;
    overflow: hidden;
    background: var(--chip);
  }

  .cover :global(img) {
    transition: scale 600ms var(--ease-out);
  }

  @media (hover: hover) {
    .featured:hover .cover :global(img) {
      scale: 1.03;
    }
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 22px 26px;
  }

  .meta {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-4);
  }

  .latest {
    color: var(--orange-ink);
  }

  .title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.15;
    text-wrap: balance;
  }

  .excerpt {
    margin: 0;
    font-size: 15.5px;
    line-height: 1.6;
    color: var(--ink-2);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  @media (max-width: 767px) {
    .cover {
      height: auto;
      aspect-ratio: 1000 / 420;
    }

    .body {
      padding: 16px 18px 18px;
    }

    .title {
      font-size: 22px;
    }
  }
</style>
