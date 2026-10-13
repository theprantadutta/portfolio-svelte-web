<script lang="ts">
  import Phone from '#components/projects/Phone.svelte'
  import type { ImageRef } from '#lib/projects.js'

  interface Props {
    phones: { slug: string; title: string; shot: ImageRef }[]
  }

  let { phones }: Props = $props()

  /** Three phones fan out left, centre, right; fewer stay centred. */
  const SLOTS = {
    1: ['centre'],
    2: ['left', 'centre'],
    3: ['left', 'centre', 'right'],
  } as Record<number, string[]>

  const slots = $derived(SLOTS[Math.min(phones.length, 3)] ?? [])
</script>

<!--
  Real app screenshots fanned above the heatmap, standing behind its card
  (README §01's empty top-right). They back up "N apps in production" with
  the actual apps. Desktop only: below 1024px the hero stacks.
-->
{#if phones.length}
  <div class="phones enter" style:--d="260ms">
    {#each phones.slice(0, 3) as phone, i (phone.slug)}
      <a
        class="slot {slots[i]}"
        href="/projects/{phone.slug}"
        aria-label={phone.title}
        data-sveltekit-preload-data="hover"
      >
        <Phone
          image={phone.shot}
          alt=""
          width={slots[i] === 'centre' ? 126 : 118}
          priority={slots[i] === 'centre'}
        />
      </a>
    {/each}
  </div>
{/if}

<style>
  .phones {
    position: relative;
    height: 200px;
    /* Tucks the phones' lower edge behind the heatmap card below. */
    margin-bottom: -46px;
  }

  .slot {
    position: absolute;
    bottom: 0;
    left: 50%;
    display: flex;
    transition: transform 450ms var(--ease-out);
  }

  .left {
    transform: translateX(-170px) translateY(18px) rotate(-9deg);
  }

  .centre {
    z-index: 1;
    transform: translateX(-50%);
  }

  .right {
    transform: translateX(52px) translateY(18px) rotate(9deg);
  }

  @media (hover: hover) {
    .phones:hover .left {
      transform: translateX(-186px) translateY(10px) rotate(-12deg);
    }

    .phones:hover .centre {
      transform: translateX(-50%) translateY(-8px);
    }

    .phones:hover .right {
      transform: translateX(68px) translateY(10px) rotate(12deg);
    }
  }

  @media (max-width: 1023px) {
    .phones {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .slot {
      transition: none;
    }
  }
</style>
