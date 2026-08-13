<script lang="ts">
  import SectionLink from '$components/SectionLink.svelte'
  import SectionMarker from '$components/SectionMarker.svelte'
  import {
    CV_PATH,
    GITHUB_LINK,
    LINKED_IN_LINK,
    X_LINK,
  } from '$lib/constants/selectors'
  import BsArrowRight from '$icons/BsArrowRight.svelte'
  import BsLinkedin from '$icons/BsLinkedin.svelte'
  import BsTwitterX from '$icons/BsTwitterX.svelte'
  import FaGithubSquare from '$icons/FaGithubSquare.svelte'
  import HiDownload from '$icons/HiDownload.svelte'
</script>

<section
  id="home"
  class="relative flex min-h-[70vh] scroll-mt-28 flex-col items-center justify-center gap-8 px-4 pb-8 text-center sm:mb-0 lg:pb-12"
>
  <SectionMarker section="Home" threshold={0.5} />

  <!-- Background accents -->
  <div class="pointer-events-none absolute inset-0 -z-10 hidden md:block">
    <div
      class="from-primary-400/15 via-secondary-400/15 to-accent-400/15 absolute top-1/4 left-1/2 h-96 w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br opacity-70 blur-2xl"
    ></div>
    <div
      class="from-primary-400/15 to-primary-500/15 absolute top-[32%] right-[12%] h-64 w-[16rem] rounded-full bg-linear-to-br opacity-60 blur-xl"
    ></div>
    <div
      class="from-secondary-400/15 to-accent-500/15 absolute bottom-[18%] left-[18%] h-72 w-[18rem] rounded-full bg-linear-to-br opacity-60 blur-xl"
    ></div>
  </div>

  <!-- Profile -->
  <div class="flex items-center justify-center">
    <div class="relative h-28 w-28">
      <span
        class="from-primary-500 via-secondary-500 to-accent-500 absolute inset-0 rounded-full bg-linear-to-br opacity-25 blur-md"
      ></span>
      <div
        class="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-2xl dark:border-gray-800"
      >
        <!--
          <enhanced:img> transcodes this at build time into AVIF/WebP
          derivatives with a srcset, so the 2.6MB source PNG never reaches a
          browser. This is the local-image half of what next/image used to do
          at request time, moved into the build where it costs nothing at
          runtime. Rendered at 112px, hence the narrow candidate widths.
        -->
        <enhanced:img
          src="$lib/assets/profile_studio_gibli.png?w=336;224;112"
          sizes="112px"
          alt="Pranta Dutta - Full Stack Developer"
          fetchpriority="high"
          loading="eager"
          class="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div
        class="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-yellow-400 to-orange-500 shadow-lg"
      >
        <span class="text-base">👋</span>
      </div>
      <div
        class="absolute top-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-linear-to-br from-green-400 to-emerald-500 shadow-lg dark:border-gray-800"
      >
        <div
          class="h-full w-full animate-ping rounded-full bg-green-300 opacity-75"
        ></div>
      </div>
    </div>
  </div>

  <!-- Intro copy -->
  <div class="space-y-6">
    <h1
      class="text-3xl leading-tight font-bold text-gray-800 sm:text-5xl lg:text-6xl dark:text-gray-100"
    >
      <span class="block">
        Hello, I'm <span class="heading-primary">Pranta</span><span
          class="text-2xl sm:text-4xl">.</span
        >
      </span>
      <span
        class="mt-3 block text-xl font-medium text-gray-600 sm:text-3xl lg:text-4xl dark:text-gray-400"
      >
        Flutter &amp; Mobile Engineer with <span
          class="text-gradient font-semibold">4 years</span
        > of experience.
      </span>
    </h1>

    <p
      class="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-gray-400"
    >
      I build mobile apps, backend APIs, and the infrastructure that connects
      them. 4 years shipping production systems in <span
        class="text-gradient font-semibold">Flutter</span
      >, <span class="text-gradient font-semibold">React Native</span>,
      <span class="text-gradient font-semibold">Go</span>, and
      <span class="text-gradient font-semibold">.NET</span> — plus a hands-on
      experience building
      <span class="text-gradient font-semibold">AI/LLM integrations</span>.
    </p>
  </div>

  <!-- Calls-to-action -->
  <div class="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
    <SectionLink
      href="#contact"
      section="Contact"
      class="btn-primary special-border group relative overflow-hidden px-5 py-2.5"
    >
      <span class="relative z-10 flex items-center gap-2">
        Contact me here
        <BsArrowRight
          class="transition-transform duration-300 group-hover:translate-x-1"
        />
      </span>
      <span
        class="from-primary-600 via-secondary-600 to-primary-600 absolute inset-0 bg-linear-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      ></span>
    </SectionLink>

    <a
      class="btn-secondary special-border group relative overflow-hidden px-5 py-2.5"
      href={CV_PATH}
      download
    >
      <span class="relative z-10 flex items-center gap-2">
        <HiDownload
          class="transition-transform duration-300 group-hover:translate-y-1"
        />
        Download CV
      </span>
    </a>
  </div>

  <!-- Social links -->
  <div class="mt-8 flex flex-wrap justify-center gap-4">
    <a
      class="glass-card special-border group relative flex h-12 w-12 items-center justify-center text-gray-700 transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      href={GITHUB_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit my GitHub profile"
    >
      <FaGithubSquare
        class="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
      />
      <span
        class="absolute inset-0 rounded-2xl bg-linear-to-br from-gray-500/20 to-gray-700/20 opacity-0 blur-xs transition-opacity duration-300 group-hover:opacity-100"
      ></span>
    </a>

    <a
      class="glass-card special-border group hover:text-primary-600 dark:hover:text-primary-400 relative flex h-12 w-12 items-center justify-center text-gray-700 transition-all duration-300 hover:-translate-y-1 hover:scale-110 dark:text-gray-300"
      href={LINKED_IN_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit my LinkedIn profile"
    >
      <BsLinkedin
        class="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
      />
      <span
        class="from-primary-500/20 to-primary-600/20 absolute inset-0 rounded-2xl bg-linear-to-br opacity-0 blur-xs transition-opacity duration-300 group-hover:opacity-100"
      ></span>
    </a>

    <a
      class="glass-card special-border group relative flex h-12 w-12 items-center justify-center text-gray-700 transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      href={X_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit my X profile"
    >
      <BsTwitterX
        class="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
      />
      <span
        class="absolute inset-0 rounded-2xl bg-linear-to-br from-gray-500/20 to-gray-700/20 opacity-0 blur-xs transition-opacity duration-300 group-hover:opacity-100"
      ></span>
    </a>
  </div>
</section>
