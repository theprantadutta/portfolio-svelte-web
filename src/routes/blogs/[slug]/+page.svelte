<script lang="ts">
  import BlogDetail from '$components/BlogDetail.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const article = $derived(data.article)
  const title = $derived(`${article.title} | Pranta Dutta`)
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={article.description} />
  {#if article.canonical_url}
    <link rel="canonical" href={article.canonical_url} />
  {/if}

  <meta property="og:type" content="article" />
  <meta property="og:title" content={article.title} />
  <meta property="og:description" content={article.description} />
  <meta property="article:published_time" content={article.published_at} />
  <meta property="article:author" content={article.user.name} />
  {#each article.tag_list as tag (tag)}
    <meta property="article:tag" content={tag} />
  {/each}
  {#if article.cover_image}
    <meta property="og:image" content={article.cover_image} />
  {/if}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={article.title} />
  <meta name="twitter:description" content={article.description} />
  {#if article.cover_image}
    <meta name="twitter:image" content={article.cover_image} />
  {/if}
</svelte:head>

<BlogDetail {article} />
