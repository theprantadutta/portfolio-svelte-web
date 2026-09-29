<script lang="ts">
  import { onMount } from 'svelte'
  import { navigating, page } from '$app/state'

  import About from '$components/About.svelte'
  import Contact from '$components/Contact.svelte'
  import Experience from '$components/Experience.svelte'
  import Intro from '$components/Intro.svelte'
  import OpenSource from '$components/OpenSource.svelte'
  import PopularBlogs from '$components/PopularBlogs.svelte'
  import Projects from '$components/Projects.svelte'
  import SectionDivider from '$components/SectionDivider.svelte'
  import Skills from '$components/Skills.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let main: HTMLElement

  /*
    The sections below the intro skip layout while offscreen (see
    `main[data-defer-sections]` in app.css) and stand in as 720px placeholders
    until they render. That is what makes the first paint fast, but any jump
    computes its target against the placeholders: Projects alone is ~3000px
    tall, so /#open-source landed in the middle of the project cards and the
    section then slid further down as the cards above it rendered.

    So the deferral is kept only for what it is for, the first paint of a plain
    visit, and every jump lays the sections out for real first:
    - arriving by client-side navigation (the nav's /#open-source from another
      page, or back/forward to a saved position). onMount runs before
      SvelteKit scrolls, so its scroll lands on the real layout;
    - a full page load with a hash, which the browser has already scrolled
      against the placeholders, so scroll again;
    - clicking an in-page #link, which the capture listener sees before the
      browser (or SvelteKit) scrolls.
  */
  onMount(() => {
    const renderAll = () => main.removeAttribute('data-defer-sections')

    if (navigating.type) {
      renderAll()
    } else if (page.url.hash) {
      renderAll()
      document
        .getElementById(decodeURIComponent(page.url.hash.slice(1)))
        ?.scrollIntoView({ behavior: 'instant' })
    }

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a')
      if (link?.hash && link.pathname === location.pathname) renderAll()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  })

  const title = 'Pranta Dutta | Flutter & Mobile Engineer'
  const description =
    'Pranta Dutta is a Flutter & Mobile Engineer with 4+ years of experience building production apps, backend APIs, and AI-powered systems. Explore his projects and get in touch.'
  const ogDescription =
    'Flutter & Mobile Engineer with 4+ years shipping production apps, backend APIs, and AI-powered systems.'
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta
    name="keywords"
    content="Pranta Dutta, Flutter Developer, Mobile Engineer, Flutter, React Native, Go, ASP.NET Core, AI integrations, Full Stack Developer, Portfolio"
  />
  <link rel="canonical" href="https://pranta.dev/" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:url" content="https://pranta.dev/" />
  <meta property="og:image" content="https://pranta.dev/profile.png" />
  <meta property="og:image:width" content="400" />
  <meta property="og:image:height" content="400" />
  <meta
    property="og:image:alt"
    content="Pranta Dutta - Flutter & Mobile Engineer"
  />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={ogDescription} />
  <meta name="twitter:image" content="https://pranta.dev/profile.png" />
</svelte:head>

<main
  bind:this={main}
  data-defer-sections
  class="flex flex-col items-center px-4"
>
  <Intro />
  <SectionDivider />
  <About />
  <SectionDivider />
  <Projects showAllProjects={false} projects={data.projects} />
  <SectionDivider />
  <OpenSource />
  <SectionDivider />
  <PopularBlogs articles={data.popularBlogs} />
  <SectionDivider />
  <Skills />
  <SectionDivider />
  <Experience />
  <SectionDivider />
  <Contact />
</main>
