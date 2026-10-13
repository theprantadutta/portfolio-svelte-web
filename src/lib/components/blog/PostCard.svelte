<script lang="ts">
  import DevToImage from '#components/DevToImage.svelte'
  import { spotlight } from '#lib/motion/pointer.js'
  import { postDate, type PostSummary } from './posts'

  interface Props {
    post: PostSummary
    /**
     * Name the cover and title for the shared-element morph into the post.
     * Only a handful of cards carry the names permanently (every named
     * element is snapshotted on every route change); the rest get them at
     * the moment they are clicked.
     */
    named?: boolean
  }

  let { post, named = false }: Props = $props()

  let cover: HTMLElement
  let title: HTMLElement

  const nameForTransition = () => {
    cover.style.viewTransitionName = `post-cover-${post.slug}`
    title.style.viewTransitionName = `post-title-${post.slug}`
  }
</script>

<a
  class="card post lift spotlight"
  href="/blogs/{post.slug}"
  use:spotlight
  onclick={named ? undefined : nameForTransition}
>
  <div
    class="thumb"
    bind:this={cover}
    style:view-transition-name={named ? `post-cover-${post.slug}` : undefined}
  >
    <DevToImage
      src={post.cover}
      alt=""
      fill
      class="object-cover"
      sizes="140px"
    />
  </div>
  <div class="text">
    <p class="meta">
      {post.hash} · {postDate(post.publishedAt)} · {post.minutes} min
    </p>
    <h3
      class="title"
      bind:this={title}
      style:view-transition-name={named ? `post-title-${post.slug}` : undefined}
    >
      {post.title}
    </h3>
  </div>
</a>

<style>
  .post {
    display: grid;
    grid-template-columns: 140px minmax(0, 1fr);
    gap: 16px;
    align-items: center;
    padding: 12px;
    border-radius: 16px;
  }

  /* Flat at rest like the design; .lift supplies the shadow on hover. */
  .post:not(:hover) {
    box-shadow: none;
  }

  .thumb {
    position: relative;
    height: 86px;
    border-radius: 10px;
    overflow: hidden;
    background: var(--chip);
  }

  .thumb :global(img) {
    transition: scale 600ms var(--ease-out);
  }

  @media (hover: hover) {
    .post:hover .thumb :global(img) {
      scale: 1.03;
    }
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }

  .meta {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-4);
  }

  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (max-width: 479px) {
    .post {
      grid-template-columns: 112px minmax(0, 1fr);
      gap: 12px;
      padding: 10px;
    }

    .thumb {
      height: 72px;
    }

    .title {
      font-size: 15px;
    }
  }
</style>
