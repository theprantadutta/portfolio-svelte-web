<script lang="ts" module>
  export type StoreKind = 'google-play' | 'app-store' | 'github'
</script>

<script lang="ts">
  import BrandIcon from '#components/ui/BrandIcon.svelte'

  let { kind, href }: { kind: StoreKind; href: string } = $props()

  /** The wording of the official store badges, and a GitHub one to match. */
  const TEXT = {
    'google-play': { caption: 'GET IT ON', name: 'Google Play' },
    'app-store': { caption: 'Download on the', name: 'App Store' },
    github: { caption: 'View source on', name: 'GitHub' },
  } satisfies Record<StoreKind, { caption: string; name: string }>

  const text = $derived(TEXT[kind])
</script>

<a
  class="badge"
  class:google={kind === 'google-play'}
  {href}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="{text.caption} {text.name}"
>
  <span class="logo" aria-hidden="true">
    {#if kind === 'google-play'}
      <!-- The four-colour Play logo, from gilbarbara/logos (CC0). -->
      <svg width="22" height="24" viewBox="0 0 256 283">
        <path
          fill="#ea4335"
          d="M119.553 134.916L1.06 259.061a32.14 32.14 0 0 0 47.062 19.071l133.327-75.934z"
        />
        <path
          fill="#fbbc04"
          d="M239.37 113.814L181.715 80.79l-64.898 56.95l65.162 64.28l57.216-32.67a31.345 31.345 0 0 0 0-55.537z"
        />
        <path
          fill="#4285f4"
          d="M1.06 23.487A30.6 30.6 0 0 0 0 31.61v219.327a32.3 32.3 0 0 0 1.06 8.124l122.555-120.966z"
        />
        <path
          fill="#34a853"
          d="m120.436 141.274l61.278-60.483L48.564 4.503A32.85 32.85 0 0 0 32.051 0C17.644-.028 4.978 9.534 1.06 23.399z"
        />
      </svg>
    {:else}
      <BrandIcon name={kind === 'app-store' ? 'apple' : 'github'} size={24} />
    {/if}
  </span>
  <span class="text" aria-hidden="true">
    <span class="caption">{text.caption}</span>
    <span class="name">{text.name}</span>
  </span>
</a>

<style>
  /* Store badges look the same on every site and in both themes: black, with
     the thin grey border Apple and Google ship on theirs. These are the
     badges' own colours, not the site's tokens. */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 48px;
    padding: 0 12px 0 10px;
    border: 1px solid #a6a6a6;
    border-radius: 10px;
    background: #000;
    color: #fff;
    transition:
      transform var(--dur-2) var(--ease-out),
      border-color var(--dur-1) linear;
  }

  .logo {
    display: grid;
    place-items: center;
    width: 26px;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    white-space: nowrap;
  }

  .caption {
    font-size: 10px;
    line-height: 1;
    letter-spacing: 0.01em;
  }

  .google .caption {
    font-size: 9.5px;
    letter-spacing: 0.06em;
  }

  .name {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  .badge:active {
    transform: scale(0.97);
  }

  @media (hover: hover) {
    .badge:hover {
      transform: translateY(-1px);
      border-color: #fff;
    }
  }
</style>
