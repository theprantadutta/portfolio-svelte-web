<script lang="ts">
  import Self from './StrapiBlocks.svelte'

  /**
   * Renders Strapi's rich-text "blocks" JSON.
   *
   * Replaces @strapi/blocks-react-renderer, reproducing its default element
   * mapping — paragraph/heading/list/quote/code/image/link plus the bold,
   * italic, underline, strikethrough and code text modifiers. Output lands
   * inside a `prose` container, which is what styles it, so the tag choices
   * have to match the old renderer exactly.
   */
  interface BlockNode {
    type: string
    children?: BlockNode[]
    text?: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strikethrough?: boolean
    code?: boolean
    level?: number
    format?: 'ordered' | 'unordered'
    url?: string
    image?: {
      url: string
      alternativeText?: string | null
      width?: number
      height?: number
    }
  }

  let { content }: { content: BlockNode[] } = $props()
</script>

{#each content ?? [] as node, index (index)}
  {#if node.type === 'text'}
    {@const text = node.text ?? ''}
    {#if node.code}
      <code>{text}</code>
    {:else if node.bold && node.italic}
      <strong><em>{text}</em></strong>
    {:else if node.bold}
      <strong>{text}</strong>
    {:else if node.italic}
      <em>{text}</em>
    {:else if node.underline}
      <u>{text}</u>
    {:else if node.strikethrough}
      <del>{text}</del>
    {:else}
      {text}
    {/if}
  {:else if node.type === 'paragraph'}
    <p><Self content={node.children ?? []} /></p>
  {:else if node.type === 'heading'}
    {#if node.level === 1}
      <h1><Self content={node.children ?? []} /></h1>
    {:else if node.level === 2}
      <h2><Self content={node.children ?? []} /></h2>
    {:else if node.level === 3}
      <h3><Self content={node.children ?? []} /></h3>
    {:else if node.level === 4}
      <h4><Self content={node.children ?? []} /></h4>
    {:else if node.level === 5}
      <h5><Self content={node.children ?? []} /></h5>
    {:else}
      <h6><Self content={node.children ?? []} /></h6>
    {/if}
  {:else if node.type === 'list'}
    {#if node.format === 'ordered'}
      <ol><Self content={node.children ?? []} /></ol>
    {:else}
      <ul><Self content={node.children ?? []} /></ul>
    {/if}
  {:else if node.type === 'list-item'}
    <li><Self content={node.children ?? []} /></li>
  {:else if node.type === 'quote'}
    <blockquote><Self content={node.children ?? []} /></blockquote>
  {:else if node.type === 'code'}
    <pre><code><Self content={node.children ?? []} /></code></pre>
  {:else if node.type === 'link'}
    <a href={node.url} target="_blank" rel="noopener noreferrer">
      <Self content={node.children ?? []} />
    </a>
  {:else if node.type === 'image' && node.image}
    <img
      src={node.image.url}
      alt={node.image.alternativeText ?? ''}
      width={node.image.width}
      height={node.image.height}
      loading="lazy"
      decoding="async"
    />
  {:else if node.children}
    <Self content={node.children} />
  {/if}
{/each}
