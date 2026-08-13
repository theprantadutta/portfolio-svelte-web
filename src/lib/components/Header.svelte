<script lang="ts">
  import clsx from 'clsx'
  import { page } from '$app/state'

  import { getActiveSectionState } from '$lib/context/active-section.svelte'
  import { links } from '$lib/data/links'
  import FiBookOpen from '$icons/FiBookOpen.svelte'
  import FiBriefcase from '$icons/FiBriefcase.svelte'
  import FiGithub from '$icons/FiGithub.svelte'
  import FiHome from '$icons/FiHome.svelte'
  import FiMail from '$icons/FiMail.svelte'
  import FiMenu from '$icons/FiMenu.svelte'
  import FiStar from '$icons/FiStar.svelte'
  import FiUser from '$icons/FiUser.svelte'
  import FiX from '$icons/FiX.svelte'

  const active = getActiveSectionState()

  let isMenuOpen = $state(false)
  let isScrolled = $state(false)

  // Icon mapping for navigation items
  const navigationIcons: Record<string, typeof FiHome> = {
    Home: FiHome,
    About: FiUser,
    Projects: FiBriefcase,
    Blogs: FiBookOpen,
    'Open Source': FiGithub,
    Skills: FiStar,
    Experience: FiBriefcase,
    Contact: FiMail,
  }

  // Route-based pages own the highlight: on /projects or /blogs the matching
  // nav item stays lit regardless of what the scroll observer sees.
  $effect(() => {
    const pathname = page.url.pathname
    for (const link of links) {
      if (!link.hash.startsWith('/#') && pathname.startsWith(link.hash)) {
        active.setActiveSection(link.name)
        return
      }
    }
  })

  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen
  }

  const handleNavClick = (sectionName: (typeof links)[number]['name']) => {
    active.registerClick(sectionName)
    isMenuOpen = false
  }
</script>

<svelte:window onscroll={() => (isScrolled = window.scrollY > 20)} />

<header class="relative z-10">
  <!-- Desktop Navigation -->
  <nav
    class="fixed top-6 left-1/2 z-1000 hidden -translate-x-1/2 transform rounded-tl-3xl rounded-tr-lg rounded-br-3xl rounded-bl-3xl transition-all duration-500 ease-out lg:block {isScrolled
      ? 'border border-white/30 bg-white/20 shadow-lg backdrop-blur-xl dark:border-white/20 dark:bg-gray-900/40'
      : 'border border-transparent bg-transparent'}"
  >
    <!-- Enhanced gradient overlay - only when scrolled -->
    <div
      class="from-primary-500/10 via-secondary-500/10 to-primary-500/10 absolute inset-0 rounded-tl-3xl rounded-tr-lg rounded-br-3xl rounded-bl-3xl bg-linear-to-r transition-opacity duration-500"
      style="opacity: {isScrolled ? 1 : 0}"
    ></div>

    <ul class="relative z-10 flex items-center gap-1 px-4 py-2">
      {#each links as link (link.hash)}
        {@const IconComponent = navigationIcons[link.name]}
        <li class="relative">
          <a
            class={clsx(
              'group relative flex items-center gap-2 rounded-tl-3xl rounded-tr-lg rounded-br-3xl rounded-bl-3xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300',
              {
                'from-primary-600 to-secondary-600 shadow-primary-500/25 bg-linear-to-r text-white shadow-lg':
                  active.activeSection === link.name,
                [`text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white ${
                  isScrolled
                    ? 'hover:bg-white/50 dark:hover:bg-white/10'
                    : 'hover:bg-white/30 dark:hover:bg-white/5'
                }`]: active.activeSection !== link.name,
              }
            )}
            href={link.hash}
            onclick={() => handleNavClick(link.name)}
          >
            {#if IconComponent}
              <IconComponent class="h-4 w-4" />
            {/if}
            <span>{link.name}</span>

            <!-- Hover effect -->
            {#if active.activeSection !== link.name}
              <div
                class="from-primary-500/10 to-secondary-500/10 absolute inset-0 rounded-xl bg-linear-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              ></div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Mobile Menu Button -->
  <div class="fixed top-4 right-4 z-1001 lg:hidden">
    <button
      onclick={toggleMenu}
      aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isMenuOpen}
      class="special-border glass-card relative h-12 w-12 transform border-white/30 bg-white/20 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 dark:border-white/20 dark:bg-gray-900/40 {isMenuOpen
        ? 'bg-linear-to-r from-red-500 to-pink-500 text-white shadow-red-500/25'
        : 'text-gray-700 dark:text-gray-300'} "
    >
      <div class="flex h-full w-full items-center justify-center">
        {#if isMenuOpen}
          <FiX class="h-5 w-5" />
        {:else}
          <FiMenu class="h-5 w-5" />
        {/if}
      </div>

      <!-- Glow effect -->
      <div
        class="absolute inset-0 rounded-2xl transition-opacity duration-300 {isMenuOpen
          ? 'bg-linear-to-r from-red-500 to-pink-500 opacity-20 blur-lg'
          : 'from-primary-500 to-secondary-500 bg-linear-to-r opacity-0 blur-lg hover:opacity-20'} "
      ></div>
    </button>
  </div>

  <!-- Mobile Menu Overlay -->
  {#if isMenuOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 z-999 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
      onclick={toggleMenu}
    >
      <!-- Mobile Menu Panel -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="glass-card special-border absolute top-20 right-4 w-72 scale-100 transform border-white/30 bg-white/20 opacity-100 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out dark:border-white/20 dark:bg-gray-900/40"
        style="padding: 1.5rem"
        onclick={(e) => e.stopPropagation()}
      >
        <!-- Enhanced gradient background -->
        <div
          class="special-border from-primary-500/10 via-secondary-500/10 to-accent-500/10 absolute inset-0 bg-linear-to-br"
        ></div>
        <!-- Additional blur layer -->
        <div class="special-border absolute inset-0 backdrop-blur-lg"></div>

        <div class="relative">
          <!-- Menu Header -->
          <div class="mb-6">
            <h3
              class="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-200"
            >
              Navigation
            </h3>
            <div
              class="from-primary-500 to-secondary-500 h-1 w-12 rounded-full bg-linear-to-r"
            ></div>
          </div>

          <!-- Menu Items -->
          <ul class="space-y-2">
            {#each links as link, index (link.hash)}
              {@const IconComponent = navigationIcons[link.name]}
              <li
                class="translate-x-0 transform opacity-100 transition-all duration-200 ease-out"
                style="transition-delay: {index * 30}ms"
              >
                <a
                  href={link.hash}
                  class={clsx(
                    'group relative flex items-center gap-3 overflow-hidden rounded-tl-3xl rounded-tr-lg rounded-br-3xl rounded-bl-3xl px-4 py-3 text-base font-medium transition-all duration-300',
                    {
                      'from-primary-600 to-secondary-600 bg-linear-to-r text-white shadow-lg':
                        active.activeSection === link.name,
                      'hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 text-gray-700 hover:bg-linear-to-r dark:text-gray-300':
                        active.activeSection !== link.name,
                    }
                  )}
                  onclick={() => handleNavClick(link.name)}
                >
                  <!-- Icon -->
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 {active.activeSection ===
                    link.name
                      ? 'bg-white/20'
                      : 'from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 bg-linear-to-br group-hover:scale-110'} "
                  >
                    {#if IconComponent}
                      <IconComponent
                        class="h-4 w-4 transition-colors duration-300 {active.activeSection ===
                        link.name
                          ? 'text-white'
                          : 'text-primary-600 dark:text-primary-400'} "
                      />
                    {/if}
                  </div>

                  <!-- Text -->
                  <span class="flex-1">{link.name}</span>

                  <!-- Active indicator -->
                  {#if active.activeSection === link.name}
                    <div class="h-2 w-2 rounded-full bg-white"></div>
                  {/if}

                  <!-- Hover effect -->
                  <div
                    class="from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 absolute inset-0 rounded-xl bg-linear-to-r transition-all duration-300"
                  ></div>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  {/if}
</header>
