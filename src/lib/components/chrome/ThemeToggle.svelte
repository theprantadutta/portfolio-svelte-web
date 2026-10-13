<script lang="ts">
  import Moon from '@lucide/svelte/icons/moon'
  import Sun from '@lucide/svelte/icons/sun'

  import { getThemeState } from '#lib/context/theme.svelte.js'

  interface Props {
    class?: string
    /** For the dark mobile menu sheet, which keeps its own colours. */
    onDark?: boolean
  }

  let { class: className = '', onDark = false }: Props = $props()

  const theme = getThemeState()

  const toggle = (event: MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    theme.toggle({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }
</script>

<!--
  Both icons are always rendered and CSS shows the right one from data-theme,
  which the inline script in app.html set before first paint. That keeps the
  prerendered button correct without waiting for hydration.
-->
<button
  type="button"
  class="toggle {className}"
  class:on-dark={onDark}
  onclick={toggle}
  aria-label="Toggle dark mode"
  title="Toggle theme"
>
  <span class="icons" aria-hidden="true">
    <Moon class="moon" size={16} strokeWidth={1.75} />
    <Sun class="sun" size={16} strokeWidth={1.75} />
  </span>
</button>

<style>
  .toggle {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border-strong);
    background: var(--surface);
    color: var(--ink);
    transition: border-color var(--dur-1) linear;
  }

  .toggle:hover {
    border-color: var(--ink);
  }

  .toggle.on-dark {
    width: 100%;
    height: 100%;
    min-height: 44px;
    border: 0;
    border-radius: 12px;
    background: #1f2127;
    color: #ecedf0;
  }

  .icons {
    position: relative;
    display: grid;
    width: 16px;
    height: 16px;
    transition: transform 500ms var(--ease-in-out);
  }

  .icons > :global(*) {
    grid-area: 1 / 1;
    transition:
      opacity 300ms var(--ease-in-out),
      transform 500ms var(--ease-in-out);
  }

  :global([data-theme='dark']) .icons {
    transform: rotate(90deg);
  }

  :global([data-theme='light']) .icons > :global(.sun),
  :global([data-theme='dark']) .icons > :global(.moon) {
    opacity: 0;
    transform: scale(0.5);
  }

  @media (prefers-reduced-motion: reduce) {
    .icons,
    .icons > :global(*) {
      transition: none;
    }
  }
</style>
