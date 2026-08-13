<script lang="ts">
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

<main class="flex flex-col items-center px-4">
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
  <Skills skills={data.skills} />
  <SectionDivider />
  <Experience experiences={data.experiences} />
  <SectionDivider />
  <Contact />
</main>
