<script lang="ts">
  import { CV_DOWNLOAD_FILENAME, CV_PATH } from '$lib/constants/selectors'
  import { prefersReducedMotion } from '$lib/motion'

  let { label = 'cv.pdf' }: { label?: string } = $props()

  /**
   * The CV download (MOTION §4): a thin bar fills inside the button over
   * 400ms, a ✓ replaces the label, then it reverts. The download itself is
   * an ordinary link to the permanent /download-cv URL, which answers with
   * Content-Disposition: attachment, so the page never navigates away.
   */
  let phase = $state<'idle' | 'loading' | 'done'>('idle')
  let timers: ReturnType<typeof setTimeout>[] = []

  const onclick = () => {
    if (phase !== 'idle' || prefersReducedMotion.current) return
    phase = 'loading'
    timers = [
      setTimeout(() => (phase = 'done'), 400),
      setTimeout(() => (phase = 'idle'), 1800),
    ]
  }

  $effect(() => () => timers.forEach(clearTimeout))
</script>

<a
  class="btn btn-outline cv"
  href={CV_PATH}
  download={CV_DOWNLOAD_FILENAME}
  data-phase={phase}
  {onclick}
  data-sveltekit-reload
>
  <span class="label" aria-hidden={phase === 'done'}>
    <span class="arrow">↓</span>
    {label}
  </span>
  <span class="done" aria-hidden={phase !== 'done'}>✓ saved</span>
  <span class="progress" aria-hidden="true"></span>
</a>

<style>
  .cv {
    overflow: hidden;
  }

  .label,
  .done {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition:
      opacity var(--dur-2) var(--ease-out),
      translate var(--dur-2) var(--ease-out);
  }

  .done {
    position: absolute;
    inset: 0;
    justify-content: center;
    color: var(--green-ink);
    opacity: 0;
    translate: 0 6px;
  }

  [data-phase='done'] .label {
    opacity: 0;
    translate: 0 -6px;
  }

  [data-phase='done'] .done {
    opacity: 1;
    translate: none;
  }

  .progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: var(--green);
    transform: scaleX(0);
    transform-origin: left;
    opacity: 0;
  }

  [data-phase='loading'] .progress {
    opacity: 1;
    transform: scaleX(1);
    transition: transform 400ms var(--ease-out);
  }

  [data-phase='done'] .progress {
    opacity: 0;
    transform: scaleX(1);
    transition: opacity var(--dur-2) linear;
  }

  @media (hover: hover) {
    .cv:hover .arrow {
      transform: translateY(2px);
    }
  }
</style>
