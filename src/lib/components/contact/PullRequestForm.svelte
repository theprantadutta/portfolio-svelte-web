<script lang="ts">
  import { tick } from 'svelte'
  import { cubicOut } from 'svelte/easing'
  import { fade, slide } from 'svelte/transition'

  import MergedCard from '$components/contact/MergedCard.svelte'
  import { confetti } from '$lib/confetti'
  import {
    CONTACT_LABELS,
    DEFAULT_LABELS,
    LIMITS,
    mergeConflict,
    type ContactLabel,
  } from '$lib/contact'
  import { profile } from '$lib/data/profile'
  import { prefersReducedMotion } from '$lib/motion'
  import { toast } from '$lib/toast.svelte'

  let name = $state('')
  let email = $state('')
  let title = $state('')
  let description = $state('')
  let labels = $state<ContactLabel[]>([...DEFAULT_LABELS])
  let website = $state('')

  let status = $state<'idle' | 'submitting' | 'merged' | 'error'>('idle')
  let serverError = $state<string | null>(null)
  let mergedTitle = $state('')

  // The live merge status re-checks on blur and on submit (MOTION §4), not
  // on every keystroke, so it never shouts while someone is still typing.
  let checked = $state(false)
  const conflict = $derived(
    checked ? mergeConflict({ name, email, title, description }) : null
  )
  const problem = $derived(conflict ? `conflicts: ${conflict}` : serverError)

  const invalid = $derived({
    email: Boolean(conflict?.startsWith('email')),
    title: Boolean(conflict?.startsWith('title')),
  })

  // A braille spinner while the request is in flight.
  const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  let frame = $state(0)
  $effect(() => {
    if (status !== 'submitting') return
    const timer = setInterval(() => (frame = (frame + 1) % FRAMES.length), 80)
    return () => clearInterval(timer)
  })

  let host: HTMLElement

  const submit = async (event: SubmitEvent) => {
    event.preventDefault()
    checked = true
    serverError = null
    if (mergeConflict({ name, email, title, description })) {
      await tick()
      host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }

    status = 'submitting'
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          title,
          description,
          labels,
          website,
        }),
      })
      const body = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`)

      mergedTitle = title.trim()
      status = 'merged'
      await tick()
      confetti(host)
    } catch (error) {
      status = 'error'
      serverError =
        error instanceof Error ? error.message : 'Something went wrong.'
      toast.error(`Pull request failed: ${serverError}`)
    }
  }

  const reset = () => {
    name = email = title = description = ''
    labels = [...DEFAULT_LABELS]
    checked = false
    serverError = null
    status = 'idle'
  }

  const toggleLabel = (id: ContactLabel) => {
    labels = labels.includes(id)
      ? labels.filter((l) => l !== id)
      : [...labels, id]
  }

  const collapse = (node: Element) =>
    slide(node, {
      duration: prefersReducedMotion.current ? 0 : 420,
      easing: cubicOut,
    })
</script>

<div class="host" bind:this={host}>
  {#if status === 'merged'}
    <div
      in:fade={{ delay: prefersReducedMotion.current ? 0 : 260, duration: 240 }}
    >
      <MergedCard title={mergedTitle} onreset={reset} />
    </div>
  {:else}
    <form
      class="card form"
      action="/api/contact"
      method="POST"
      novalidate
      onsubmit={submit}
      out:collapse
    >
      <div class="branch" aria-live="polite">
        <span class="ref">base: pranta/inbox</span>
        <span aria-hidden="true">←</span>
        <span class="ref">compare: you/idea</span>
        {#if problem}
          <span class="state bad">✗ {problem}</span>
        {:else}
          <span class="state ok">✓ able to merge</span>
        {/if}
      </div>

      <div class="pair">
        <label class="field-wrap">
          <span class="label">Your name</span>
          <input
            class="field"
            name="name"
            bind:value={name}
            placeholder="Jane from Acme"
            autocomplete="name"
            maxlength={LIMITS.name}
            onblur={() => (checked = checked || Boolean(email || title))}
          />
        </label>
        <label class="field-wrap">
          <span class="label">Email</span>
          <input
            class="field"
            name="email"
            type="email"
            bind:value={email}
            placeholder="jane@acme.com"
            autocomplete="email"
            required
            maxlength={LIMITS.email}
            aria-invalid={invalid.email}
            onblur={() => (checked = true)}
          />
        </label>
      </div>

      <label class="field-wrap">
        <span class="label">Title</span>
        <input
          class="field"
          name="title"
          bind:value={title}
          placeholder="feat: build our Flutter app"
          required
          minlength="4"
          maxlength={LIMITS.title}
          aria-invalid={invalid.title}
          onblur={() => (checked = checked || Boolean(title))}
        />
      </label>

      <label class="field-wrap">
        <span class="label">Description</span>
        <textarea
          class="field area"
          name="description"
          bind:value={description}
          placeholder="What are you building, what's the timeline, and where can I help?"
          maxlength={LIMITS.description}
        ></textarea>
      </label>

      <fieldset class="labels">
        <legend class="label">Labels</legend>
        <div class="chips">
          {#each CONTACT_LABELS as label (label.id)}
            {@const on = labels.includes(label.id)}
            <label
              class="label-chip"
              class:on
              style:--tone="var(--{label.tone})"
              style:--tone-ink="var(--{label.tone}-ink)"
            >
              <input
                type="checkbox"
                name="labels"
                value={label.id}
                checked={on}
                onchange={() => toggleLabel(label.id)}
              />
              <span class="check" aria-hidden="true"><span>✓&nbsp;</span></span>
              {label.id}
            </label>
          {/each}
        </div>
      </fieldset>

      <!-- Honeypot: invisible to people, irresistible to form bots. -->
      <div class="hp" aria-hidden="true">
        <label
          >Website <input
            name="website"
            tabindex="-1"
            autocomplete="off"
            bind:value={website}
          /></label
        >
      </div>

      <div class="footer">
        <span class="note">{profile.responseTime}</span>
        <button class="submit" type="submit" disabled={status === 'submitting'}>
          {#if status === 'submitting'}
            <span class="spinner" aria-hidden="true">{FRAMES[frame]}</span> pushing…
          {:else}
            Create pull request
          {/if}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .host {
    position: relative;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 26px;
    border-radius: 20px;
  }

  .branch {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-2);
  }

  .ref {
    padding: 4px 10px;
    border-radius: 6px;
    background: var(--chip);
  }

  .state {
    animation: fade-in var(--dur-2) linear;
  }

  .ok {
    color: var(--green-ink);
  }

  .bad {
    color: var(--red-ink);
  }

  .pair {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 12px;
  }

  .field-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
  }

  .field[aria-invalid='true'] {
    border-color: var(--red);
  }

  .area {
    height: 120px;
    min-height: 90px;
    line-height: 1.6;
    resize: vertical;
  }

  .labels {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .labels legend {
    padding: 0;
    margin-bottom: 8px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .label-chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 7px 12px;
    border-radius: 999px;
    border: 1px solid var(--tone);
    color: var(--tone-ink);
    font-family: var(--font-mono);
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    transition:
      background-color var(--dur-2) var(--ease-out),
      color var(--dur-2) var(--ease-out),
      transform var(--dur-2) var(--ease-spring);
  }

  .label-chip:active {
    transform: scale(0.96);
  }

  .label-chip.on {
    background: var(--tone);
    color: #fff;
  }

  .label-chip input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .label-chip:has(input:focus-visible) {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }

  /* The ✓ slides in from the left as the chip's width grows. */
  .check {
    display: inline-grid;
    grid-template-columns: 0fr;
    overflow: hidden;
    transition: grid-template-columns var(--dur-2) var(--ease-out);
  }

  .check > span {
    min-width: 0;
    translate: -6px 0;
    opacity: 0;
    transition:
      translate var(--dur-2) var(--ease-out),
      opacity var(--dur-2) linear;
  }

  .on .check {
    grid-template-columns: 1fr;
  }

  .on .check > span {
    translate: none;
    opacity: 1;
  }

  .hp {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 4px;
  }

  .note {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-4);
  }

  .submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 46px;
    padding: 13px 20px;
    border-radius: 10px;
    background: var(--cta-green);
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    transition:
      transform var(--dur-2) var(--ease-out),
      filter var(--dur-1) linear;
  }

  .submit:hover {
    filter: brightness(1.06);
  }

  .submit:active {
    transform: scale(0.97);
  }

  .submit:disabled {
    cursor: progress;
  }

  .spinner {
    font-family: var(--font-mono);
  }

  @media (prefers-reduced-motion: reduce) {
    .check,
    .check > span {
      transition: none;
    }
  }

  @media (max-width: 767px) {
    .form {
      gap: 12px;
      padding: 16px;
      border-radius: 18px;
    }

    .branch,
    .note {
      display: none;
    }

    .pair {
      grid-template-columns: minmax(0, 1fr);
    }

    .label {
      font-size: 12px;
    }

    .area {
      height: 90px;
    }

    .chips {
      gap: 6px;
    }

    .label-chip {
      padding: 7px 11px;
      font-size: 12px;
    }

    .footer {
      margin-top: 0;
    }

    .submit {
      flex: 1;
      padding: 15px;
      border-radius: 12px;
    }
  }
</style>
