<script lang="ts">
  import SectionHeading from '$components/SectionHeading.svelte'
  import SectionMarker from '$components/SectionMarker.svelte'
  import SectionSubheading from '$components/SectionSubheading.svelte'

  // The React version stored each paragraph as JSX in an array and mapped over
  // it. Svelte has no equivalent value type for markup, so the paragraphs are
  // written out inline below — same copy, same spans, same classes, and the
  // shared wrapper class lives in one place.
  const paragraphClass = 'animate-fade-in-up [animation-delay:120ms]'

  const coreTechnologies = [
    {
      title: 'Mobile',
      items: ['React Native', 'Flutter', 'Android / iOS'],
    },
    {
      title: 'Backend',
      items: ['ASP.NET Core', 'Node.js', 'System Design'],
    },
    {
      title: 'Cloud & DevOps',
      items: ['Docker', 'Kubernetes', 'Google Cloud'],
    },
  ]

  const achievements = [
    {
      icon: '📱',
      title: 'Published Apps',
      subtitle: 'Play Store & App Store',
      accent: 'from-green-400 to-emerald-500',
    },
    {
      icon: '🏗️',
      title: 'Infrastructure Design',
      subtitle: 'Enterprise Solutions',
      accent: 'from-primary-400 to-secondary-500',
    },
    {
      icon: '⚡',
      title: 'Performance Tuning',
      subtitle: 'Mobile & Web',
      accent: 'from-orange-400 to-red-500',
    },
    {
      icon: '🖥️',
      title: 'Self-Hosted Infrastructure',
      subtitle: 'Ubuntu Server Stack',
      accent: 'from-primary-400 to-primary-500',
    },
    {
      icon: '🚀',
      title: '20+ Projects Completed',
      subtitle: 'Web, Mobile & Cloud',
      accent: 'from-secondary-400 to-accent-500',
    },
  ]
</script>

<section id="about" class="section-spacing-sm relative scroll-mt-28">
  <SectionMarker section="About" threshold={0.5} />

  <!-- Background accents -->
  <div
    class="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block"
  >
    <div
      class="from-secondary-400/10 to-accent-400/10 absolute top-1/4 right-0 h-72 w-[18rem] rounded-full bg-linear-to-br opacity-70 blur-2xl"
    ></div>
    <div
      class="from-primary-400/10 to-primary-400/10 absolute bottom-[18%] left-0 h-80 w-[20rem] rounded-full bg-linear-to-br opacity-60 blur-xl"
    ></div>
  </div>

  <div class="content-container">
    <div class="mb-16 text-center">
      <SectionHeading>About Me</SectionHeading>
      <SectionSubheading>
        A bit about who I am, how I got here, and what I love building
      </SectionSubheading>
    </div>

    <div class="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
      <div
        class="space-y-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300"
      >
        <p class={paragraphClass}>
          I'm a <span class="text-gradient font-semibold"
            >Flutter &amp; Mobile Engineer</span
          >
          with 4 years of experience building
          <span class="text-gradient-accent font-medium"
            >mobile apps, backend APIs, and infrastructure</span
          >. My core stack is
          <span
            class="mono from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-sm bg-linear-to-r px-2 py-1 text-sm font-semibold"
            >Flutter, React Native, Go &amp; .NET</span
          >.
        </p>

        <p class={paragraphClass}>
          I've built systems that <span class="text-gradient font-semibold"
            >actually move numbers</span
          >
          — an NFC-based distribution app that
          <span class="font-medium underline decoration-green-500"
            >reduced fraud by 99.99%</span
          >, an HRMS that
          <span class="decoration-primary-500 font-medium underline"
            >cut processing time by 40%</span
          >, and a QC system that
          <span class="decoration-secondary-500 font-medium underline"
            >eliminated 80% of reporting delays</span
          >.
        </p>

        <p class={paragraphClass}>
          Currently deep into <span class="text-gradient-accent font-semibold"
            >AI/LLM integrations</span
          >. I've built production assistants using
          <span
            class="mono from-secondary-100 to-accent-100 dark:from-secondary-900/30 dark:to-accent-900/30 rounded-sm bg-linear-to-r px-2 py-1 text-sm font-medium"
            >MCP servers, Gemini, OpenAI &amp; Claude</span
          > that answer queries dynamically from live database APIs.
        </p>

        <p class={paragraphClass}>
          I handle my own <span class="text-gradient font-semibold">DevOps</span
          >. Currently running production workloads on
          <span
            class="mono to-primary-100 dark:to-primary-900/30 rounded-sm bg-linear-to-r from-green-100 px-2 py-1 text-sm font-medium dark:from-green-900/30"
            >Hetzner VPS</span
          >
          with
          <span class="font-medium underline decoration-green-500"
            >Docker, Traefik, GitLab CI/CD, and automated backups</span
          >.
        </p>

        <p class={paragraphClass}>
          I've shipped <span class="text-gradient-accent font-semibold"
            >20+ production apps</span
          >
          — including games, tools, and enterprise systems on the
          <span class="font-medium">Google Play Store</span> and
          <span class="font-medium">Apple App Store</span>. Outside of work, I
          build
          <span class="decoration-secondary-500 font-medium underline"
            >open-source libraries and side projects</span
          > because building things is just what I do.
        </p>
      </div>

      <div class="space-y-8">
        <div
          class="glass-card special-border border border-white/10 p-6 shadow-lg backdrop-blur-xl dark:border-gray-700/40"
        >
          <h3 class="text-gradient mb-4 text-xl font-semibold">
            Core Technologies
          </h3>
          <div
            class="grid grid-cols-2 gap-4 text-sm text-gray-700 sm:grid-cols-3 dark:text-gray-300"
          >
            {#each coreTechnologies as section (section.title)}
              <div class="space-y-2">
                <h4 class="font-medium text-gray-800 dark:text-gray-200">
                  {section.title}
                </h4>
                <ul class="space-y-1">
                  {#each section.items as item (item)}
                    <li class="flex items-center gap-2">
                      <span
                        class="from-primary-500 to-secondary-500 h-2 w-2 rounded-full bg-linear-to-br"
                      ></span>
                      <span>{item}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/each}
          </div>
        </div>

        <div
          class="glass-card special-border border border-white/10 p-6 shadow-lg backdrop-blur-xl dark:border-gray-700/40"
        >
          <h3 class="text-gradient-accent mb-4 text-xl font-semibold">
            Achievements
          </h3>
          <div class="space-y-4 text-gray-700 dark:text-gray-300">
            {#each achievements as item (item.title)}
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br {item.accent}"
                >
                  <span class="text-lg">{item.icon}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
