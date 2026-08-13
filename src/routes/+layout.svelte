<script lang="ts">
  import type { Snippet } from 'svelte'

  import '../app.css'
  import Footer from '$components/Footer.svelte'
  import Header from '$components/Header.svelte'
  import StructuredData from '$components/StructuredData.svelte'
  import ThemeSwitchLazy from '$components/ThemeSwitchLazy.svelte'
  import { setActiveSectionState } from '$lib/context/active-section.svelte'
  import { setThemeState } from '$lib/context/theme.svelte'

  let { children }: { children: Snippet } = $props()

  setThemeState()
  setActiveSectionState()
</script>

<svelte:head>
  <meta name="author" content="Pranta Dutta" />
  <meta name="creator" content="Pranta Dutta" />
  <meta
    name="robots"
    content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
  />
  <meta property="og:site_name" content="Pranta Dutta Portfolio" />
  <meta property="og:locale" content="en_US" />
</svelte:head>

<div class="relative pt-20 sm:pt-24">
  <!-- Background gradient effects for portfolio pages -->
  <div class="pointer-events-none fixed inset-0 -z-10 hidden lg:block">
    <div
      class="from-primary-400/15 via-secondary-400/15 to-primary-400/15 absolute -top-16 right-40 h-96 w-[24rem] rounded-full bg-linear-to-br opacity-75 blur-2xl"
    ></div>
    <div
      class="from-secondary-400/10 via-accent-400/10 to-primary-400/10 absolute top-24 -left-60 h-120 w-152 rounded-full bg-linear-to-br opacity-70 blur-2xl"
    ></div>
    <div
      class="from-primary-400/10 to-primary-500/10 absolute -right-32 bottom-32 h-72 w-md rounded-full bg-linear-to-br opacity-60 blur-xl"
    ></div>
  </div>

  <Header />
  {@render children()}
  <Footer />
  <ThemeSwitchLazy />
</div>

<StructuredData />
