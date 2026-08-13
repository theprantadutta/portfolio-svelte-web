<script lang="ts">
  import type { Component } from 'svelte'

  import SectionHeading from '$components/SectionHeading.svelte'
  import SectionSubheading from '$components/SectionSubheading.svelte'
  import { sectionInView } from '$lib/actions/section-in-view'
  import { getActiveSectionState } from '$lib/context/active-section.svelte'
  import type { SkillDataAttributes } from '$lib/types/types'
  import BiLogoPostgresql from '$icons/BiLogoPostgresql.svelte'
  import DiGoogleCloudPlatform from '$icons/DiGoogleCloudPlatform.svelte'
  import DiMsqlServer from '$icons/DiMsqlServer.svelte'
  import FaAppStoreIos from '$icons/FaAppStoreIos.svelte'
  import FaCloud from '$icons/FaCloud.svelte'
  import FaCode from '$icons/FaCode.svelte'
  import FaDatabase from '$icons/FaDatabase.svelte'
  import FaDocker from '$icons/FaDocker.svelte'
  import FaGitAlt from '$icons/FaGitAlt.svelte'
  import FaGolang from '$icons/FaGolang.svelte'
  import FaGooglePlay from '$icons/FaGooglePlay.svelte'
  import FaHeart from '$icons/FaHeart.svelte'
  import FaNodeJs from '$icons/FaNodeJs.svelte'
  import FaReact from '$icons/FaReact.svelte'
  import FaRocket from '$icons/FaRocket.svelte'
  import FaRust from '$icons/FaRust.svelte'
  import FaStar from '$icons/FaStar.svelte'
  import FaTools from '$icons/FaTools.svelte'
  import IoLogoFirebase from '$icons/IoLogoFirebase.svelte'
  import LuBoxes from '$icons/LuBoxes.svelte'
  import SiDart from '$icons/SiDart.svelte'
  import SiDotnet from '$icons/SiDotnet.svelte'
  import SiFlutter from '$icons/SiFlutter.svelte'
  import SiKotlin from '$icons/SiKotlin.svelte'
  import SiKubernetes from '$icons/SiKubernetes.svelte'
  import SiNextdotjs from '$icons/SiNextdotjs.svelte'
  import SiRedis from '$icons/SiRedis.svelte'
  import SiTypescript from '$icons/SiTypescript.svelte'
  import TbBrandReactNative from '$icons/TbBrandReactNative.svelte'

  let { skills }: { skills: SkillDataAttributes[] } = $props()

  // Observed on the <section> itself, exactly as the React version did with a
  // ref, rather than via a zero-size SectionMarker sentinel.
  const activeSection = getActiveSectionState()

  let selectedSkill = $state<string | null>(null)
  let viewMode = $state<'hexagon' | 'cards'>('hexagon')

  type IconComponent = Component<{ class?: string }>

  const getSkillIcon = (skillName: string): IconComponent => {
    if (skillName.includes('ASP.Net Core')) return SiDotnet
    if (skillName.includes('Cloud Computing')) return FaCloud
    if (skillName.includes('Dart')) return SiDart
    if (skillName.includes('Docker')) return FaDocker
    if (skillName.includes('Flutter')) return SiFlutter
    if (skillName.includes('Git')) return FaGitAlt
    if (skillName.includes('Golang')) return FaGolang
    if (skillName.includes('Kotlin')) return SiKotlin
    if (skillName.includes('Kubernetes')) return SiKubernetes
    if (skillName.includes('Microservices')) return LuBoxes
    if (skillName.includes('Next.js')) return SiNextdotjs
    if (skillName.includes('PostgreSQL')) return BiLogoPostgresql
    if (skillName.includes('React')) return FaReact
    if (skillName.includes('React Native')) return TbBrandReactNative
    if (skillName.includes('Rust')) return FaRust
    if (skillName.includes('SQL Server')) return DiMsqlServer
    if (skillName.includes('Typescript')) return SiTypescript
    if (skillName.includes('Google Cloud Platform'))
      return DiGoogleCloudPlatform
    if (skillName.includes('Firebase')) return IoLogoFirebase
    if (skillName.includes('Redis')) return SiRedis
    return FaCode
  }

  const skillCategories = $derived(
    [
      {
        name: 'Frontend',
        skills: skills.filter((s) =>
          [
            'react',
            'react native',
            'flutter',
            'next.js',
            'typescript',
            'javascript',
            'html',
            'css',
            'tailwind',
            'dart',
          ].some((tech) => s.title.toLowerCase().includes(tech))
        ),
        color: 'from-primary-500 to-primary-500',
        icon: FaReact as IconComponent,
      },
      {
        name: 'Backend',
        skills: skills.filter((s) =>
          [
            'node.js',
            'python',
            'java',
            'golang',
            'rust',
            'asp.net core',
            'express',
            'api',
            'microservices',
          ].some((tech) => s.title.toLowerCase().includes(tech))
        ),
        color: 'from-green-500 to-emerald-500',
        icon: FaNodeJs as IconComponent,
      },
      {
        name: 'Database',
        skills: skills.filter((s) =>
          [
            'mongodb',
            'postgresql',
            'mysql',
            'sql server',
            'redis',
            'database',
          ].some((tech) => s.title.toLowerCase().includes(tech))
        ),
        color: 'from-orange-500 to-red-500',
        icon: FaDatabase as IconComponent,
      },
      {
        name: 'Cloud & DevOps',
        skills: skills.filter((s) =>
          [
            'docker',
            'git',
            'aws',
            'google cloud platform',
            'firebase',
            'tools',
          ].some((tech) => s.title.toLowerCase().includes(tech))
        ),
        color: 'from-secondary-500 to-accent-500',
        icon: FaTools as IconComponent,
      },
      {
        name: 'Design',
        skills: skills.filter((s) =>
          ['figma'].some((tech) => s.title.toLowerCase().includes(tech))
        ),
        color: 'from-yellow-500 to-amber-500',
        icon: FaTools as IconComponent,
      },
    ].filter((cat) => cat.skills.length > 0)
  )

  const stats = $derived([
    {
      label: 'Total Skills',
      value: skills.length,
      icon: FaCode as IconComponent,
      color: 'primary',
    },
    {
      label: 'Favorite',
      value: 'Flutter',
      icon: FaHeart as IconComponent,
      color: 'red',
    },
    {
      label: 'Years Exp',
      value: '4+',
      icon: FaRocket as IconComponent,
      color: 'secondary',
    },
    {
      label: 'Projects',
      value: '20+',
      icon: FaStar as IconComponent,
      color: 'yellow',
    },
  ])
</script>

<section
  id="skills"
  use:sectionInView={{
    state: activeSection,
    section: 'Skills',
    threshold: 0.1,
  }}
  class="section-spacing-sm relative scroll-mt-28 overflow-hidden"
>
  <!-- Background Elements -->
  <div class="absolute inset-0 -z-10">
    <div
      class="from-primary-500/10 to-secondary-500/10 absolute top-10 left-10 h-72 w-72 animate-pulse rounded-full bg-linear-to-r blur-3xl"
    ></div>
    <div
      class="from-accent-500/10 absolute right-10 bottom-10 h-80 w-80 animate-pulse rounded-full bg-linear-to-r to-orange-500/10 blur-3xl"
      style="animation-delay: 2s"
    ></div>
  </div>

  <div class="content-container">
    <!-- Header -->
    <div class="reveal mb-16 text-center">
      <SectionHeading>Skills &amp; Technologies</SectionHeading>
      <SectionSubheading>
        Crafting beautiful experiences with modern technologies
      </SectionSubheading>
    </div>

    <!-- View Toggle -->
    <div class="mb-12 flex justify-center">
      <div
        class="special-border glass-card flex bg-white/10 p-1 backdrop-blur-lg dark:bg-gray-900/20"
      >
        <button
          onclick={() => (viewMode = 'hexagon')}
          class="special-border mr-1 px-6 py-2 transition-all duration-300 {viewMode ===
          'hexagon'
            ? 'from-primary-500 to-secondary-500 bg-linear-to-r text-white'
            : 'hover:bg-white/10'}"
        >
          Hexagon View
        </button>
        <button
          onclick={() => (viewMode = 'cards')}
          class="special-border ml-1 px-6 py-2 transition-all duration-300 {viewMode ===
          'cards'
            ? 'from-primary-500 to-secondary-500 bg-linear-to-r text-white'
            : 'hover:bg-white/10'}"
        >
          Cards View
        </button>
      </div>
    </div>

    <!-- Skills Display -->
    {#if viewMode === 'hexagon'}
      <div class="relative">
        <!-- Hexagonal Grid -->
        <div class="mx-auto flex max-w-4xl flex-wrap justify-center gap-4">
          {#each skills.slice(0, 19) as skill, index (skill.id)}
            {@const Icon = getSkillIcon(skill.title)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="group relative cursor-pointer transition-all duration-500 hover:z-10 hover:scale-110 {index %
                2 ===
              0
                ? 'mt-8'
                : ''}"
              onclick={() =>
                (selectedSkill =
                  selectedSkill === skill.title ? null : skill.title)}
            >
              <!-- Hexagon Shape -->
              <div class="relative h-20 w-24">
                <div
                  class="absolute inset-0 bg-linear-to-br {skill.isFavourite
                    ? 'from-primary-400 to-primary-400 shadow-primary-400/50'
                    : 'from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800'} clip-hexagon transition-all duration-300 group-hover:shadow-2xl {selectedSkill ===
                  skill.title
                    ? 'scale-125 shadow-2xl'
                    : ''}"
                ></div>

                <!-- Content -->
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center p-2 text-center"
                >
                  <Icon
                    class="mb-1 h-6 w-6 {skill.isFavourite
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'}"
                  />
                  <span
                    class="text-xs leading-tight font-medium {skill.isFavourite
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'}"
                  >
                    {skill.title}
                  </span>

                  <!-- Favorite Badge -->
                  {#if skill.isFavourite}
                    <FaHeart
                      class="absolute -top-1 -right-1 h-3 w-3 animate-pulse text-red-500"
                    />
                  {/if}
                </div>

                <!-- Skill Level Dots -->
                <div
                  class="absolute -bottom-6 left-1/2 flex -translate-x-1/2 transform gap-1"
                >
                  {#each [1, 2, 3, 4, 5] as dot (dot)}
                    <div
                      class="h-1.5 w-1.5 rounded-full transition-all duration-300 {dot <=
                      skill.rating
                        ? skill.isFavourite
                          ? 'bg-primary-400'
                          : 'bg-gray-400 dark:bg-gray-600'
                        : 'bg-gray-200 dark:bg-gray-800'}"
                    ></div>
                  {/each}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <!-- Cards View -->
      <div class="space-y-12">
        {#each skillCategories as category (category.name)}
          {@const CategoryIcon = category.icon}
          <div class="space-y-6">
            <div class="flex items-center justify-center gap-3">
              <CategoryIcon
                class="h-6 w-6 bg-linear-to-r {category.color} bg-clip-text text-transparent"
              />
              <h3 class="text-2xl font-bold">{category.name}</h3>
            </div>

            <div
              class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {#each category.skills as skill, index (skill.id)}
                {@const Icon = getSkillIcon(skill.title)}
                <div
                  class="special-border glass-card group relative cursor-pointer p-4 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 {skill.isFavourite
                    ? 'border-primary-400/50 from-primary-500/20 to-primary-500/20 bg-linear-to-br'
                    : 'border-white/10 bg-white/5 dark:bg-gray-900/20'}"
                  style="animation-delay: {index * 50}ms"
                >
                  <Icon
                    class="mx-auto mb-3 h-8 w-8 {skill.isFavourite
                      ? 'text-primary-400'
                      : 'text-gray-600 dark:text-gray-400'}"
                  />
                  <h4 class="mb-3 text-sm font-medium">{skill.title}</h4>

                  <!-- Progress Bar -->
                  <div
                    class="mb-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700"
                  >
                    <div
                      class="h-1.5 rounded-full transition-all duration-1000 {skill.isFavourite
                        ? 'from-primary-400 to-primary-400 bg-linear-to-r'
                        : `bg-linear-to-r ${category.color}`}"
                      style="width: {(skill.rating / 5) * 100}%"
                    ></div>
                  </div>

                  <span class="text-xs text-gray-500">
                    {skill.rating}/5 level
                  </span>

                  <!-- Favorite Badge -->
                  {#if skill.isFavourite}
                    <div
                      class="absolute -top-2 -right-2 rounded-full bg-red-500 p-1"
                    >
                      <FaHeart class="h-3 w-3 text-white" />
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Stats -->
    <div class="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-5">
      {#each stats as stat, index (index)}
        {@const StatIcon = stat.icon}
        <div
          class="special-border glass-card bg-white/5 p-6 text-center backdrop-blur-lg dark:bg-gray-900/20"
        >
          <StatIcon class="mx-auto mb-3 h-8 w-8 text-{stat.color}-500" />
          <div class="mb-1 text-2xl font-bold">{stat.value}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {stat.label}
          </div>
        </div>
      {/each}

      <!-- Published apps -->
      <div
        class="special-border glass-card col-span-2 bg-white/5 p-6 text-center backdrop-blur-lg md:col-span-1 dark:bg-gray-900/20"
      >
        <div class="mb-3 flex items-center justify-center gap-2">
          <FaGooglePlay class="h-8 w-8 text-green-500" />
          <FaAppStoreIos class="h-8 w-8 text-green-500" />
        </div>
        <div class="mb-1 text-2xl font-bold">Live</div>
        <div class="text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
          Play/App Store
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  /*
    Was a styled-jsx block in the React component. Svelte's own scoped styles
    do the same job with no runtime — the class is compiled to a hashed
    selector at build time.
  */
  :global(.clip-hexagon) {
    clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
  }
</style>
