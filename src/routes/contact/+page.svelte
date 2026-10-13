<script lang="ts">
  import Copy from '@lucide/svelte/icons/copy'

  import PageGlow from '$components/chrome/PageGlow.svelte'
  import PullRequestForm from '$components/contact/PullRequestForm.svelte'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import { profile, socials } from '$lib/data/profile'
  import { reveal } from '$lib/motion/reveal'
  import { spotlight } from '$lib/motion/pointer'
  import { SITE_URL } from '$lib/site'
  import { copyText } from '$lib/toast.svelte'

  const title = 'Contact | Pranta Dutta'
  const description =
    'Open a pull request: hire Pranta Dutta for Flutter, mobile, backend or AI work, full-time or freelance. Usually answered within 24 hours.'

  const mobileSocials = socials.filter((social) => social.id !== 'x')
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="{SITE_URL}/contact" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="{SITE_URL}/contact" />
  <meta property="og:image" content="{SITE_URL}/og/contact.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="{SITE_URL}/og/contact.png" />
</svelte:head>

<PageGlow
  glows={[
    {
      hue: 'green',
      width: 800,
      height: 600,
      left: 240,
      bottom: -360,
      drift: 1,
    },
  ]}
/>

<div class="container-page page">
  <PageHeader
    command="$ git checkout -b let-us-work-together"
    title="Open a pull request."
  />

  <div class="layout">
    <div class="main enter" style:--d="300ms">
      <PullRequestForm />
    </div>

    <aside class="side" aria-label="Elsewhere" use:reveal={{ stagger: true }}>
      {#each socials as social (social.id)}
        {#if social.id === 'email'}
          <button
            type="button"
            class="social card lift spotlight"
            use:spotlight
            onclick={() => copyText(profile.email, 'email copied')}
            aria-label="Copy email address {profile.email}"
          >
            <span class="glyph" aria-hidden="true">{social.glyph}</span>
            <span class="who">
              <span class="name">{social.name}</span>
              <span class="handle">{social.handle}</span>
            </span>
            <span class="go" aria-hidden="true"
              ><Copy size={15} strokeWidth={1.75} /></span
            >
          </button>
        {:else}
          <a
            class="social card lift spotlight"
            use:spotlight
            href={social.url}
            target="_blank"
            rel="noopener noreferrer me"
          >
            <span class="glyph" aria-hidden="true">{social.glyph}</span>
            <span class="who">
              <span class="name">{social.name}</span>
              <span class="handle">{social.handle}</span>
            </span>
            <span class="go" aria-hidden="true">↗</span>
          </a>
        {/if}
      {/each}

      {#if profile.openToWork}
        <div class="available">
          <span class="live-dot" aria-hidden="true"></span>
          {profile.availability}
        </div>
      {/if}
    </aside>

    <!-- Phones: three plain buttons under the form (M5). -->
    <nav class="mobile-socials" aria-label="Elsewhere">
      {#each mobileSocials as social (social.id)}
        {#if social.id === 'email'}
          <button
            type="button"
            onclick={() => copyText(profile.email, 'email copied')}
          >
            email
          </button>
        {:else}
          <a href={social.url} target="_blank" rel="noopener noreferrer me"
            >{social.id}</a
          >
        {/if}
      {/each}
    </nav>
  </div>
</div>

<style>
  .page {
    padding-bottom: 48px;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 24px;
    align-items: start;
    margin-top: 26px;
  }

  .side {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .social {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 16px 18px;
    border-radius: 16px;
    box-shadow: none;
    text-align: left;
    --spot: var(--green);
  }

  .glyph {
    display: grid;
    flex: none;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--ink);
    color: var(--on-ink);
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .who {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  .name {
    font-size: 15px;
    font-weight: 600;
  }

  .handle {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .go {
    transition: transform var(--dur-2) var(--ease-out);
  }

  .social:hover .go {
    transform: translate(2px, -2px);
  }

  .available {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px;
    border-radius: 16px;
    background: #15171c;
    color: #fff;
    font-size: 14px;
    line-height: 1.4;
  }

  :global([data-theme='dark']) .available {
    background: var(--surface-muted);
    border: 1px solid var(--border-strong);
    color: var(--ink);
  }

  .available .live-dot {
    flex: none;
    width: 10px;
    height: 10px;
    background: oklch(0.7 0.15 150);
  }

  .mobile-socials {
    display: none;
  }

  @media (max-width: 1023px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 767px) {
    .layout {
      gap: 12px;
      margin-top: 14px;
    }

    .side {
      display: none;
    }

    .mobile-socials {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .mobile-socials > * {
      display: grid;
      place-items: center;
      min-height: 46px;
      padding: 14px 4px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      font-family: var(--font-mono);
      font-size: 12px;
    }
  }
</style>
