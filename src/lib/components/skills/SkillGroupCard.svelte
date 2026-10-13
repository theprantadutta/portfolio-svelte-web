<script lang="ts">
  import type { SkillTone } from '$lib/data/skills'

  interface Props {
    name: string
    branch: string
    tone: SkillTone
    skills: { name: string; daily: boolean; projects: number | null }[]
  }

  let { name, branch, tone, skills }: Props = $props()

  const describe = (skill: Props['skills'][number]) =>
    [
      skill.projects === null
        ? null
        : `${skill.projects} project${skill.projects === 1 ? '' : 's'}`,
      skill.daily ? 'daily driver' : 'comfortable',
    ]
      .filter(Boolean)
      .join(' · ')
</script>

<section class="group" aria-label="{name} skills">
  <div class="head">
    <h2><span class="dot" style:--c="var(--{tone})"></span>{name}</h2>
    <span class="branch">branch: {branch}</span>
  </div>
  <ul class="chips">
    {#each skills as skill (skill.name)}
      <li class="skill" class:daily={skill.daily} data-tip={describe(skill)}>
        {skill.name}<span class="sr-only">: {describe(skill)}</span>
      </li>
    {/each}
  </ul>
</section>

<style>
  .group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 20px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 17px;
    font-weight: 600;
  }

  h2 .dot {
    width: 10px;
    height: 10px;
  }

  .branch {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-4);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .skill {
    position: relative;
    padding: 6px 11px;
    border-radius: 8px;
    background: var(--chip);
    color: var(--ink-body);
    font-size: 14px;
    line-height: 1.4;
    cursor: default;
    transition: transform var(--dur-2) var(--ease-spring);
  }

  .skill.daily {
    background: var(--ink);
    color: var(--on-ink);
    font-weight: 600;
  }

  /* Hover tooltip (MOTION §4 "Skills"): how many projects on this site use
     it, and how comfortable. Screen readers get the same text inline. */
  .skill::after {
    content: attr(data-tip);
    position: absolute;
    z-index: 5;
    left: 50%;
    bottom: calc(100% + 8px);
    translate: -50% 4px;
    padding: 6px 9px;
    border-radius: 8px;
    background: var(--ink);
    color: var(--on-ink);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 400;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition:
      opacity var(--dur-2) var(--ease-out),
      translate var(--dur-2) var(--ease-out);
  }

  @media (hover: hover) {
    .skill:hover {
      transform: translateY(-1px);
    }

    .skill:hover::after {
      opacity: 1;
      translate: -50% 0;
    }
  }
</style>
