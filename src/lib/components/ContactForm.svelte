<script lang="ts">
  import SubmitBtn from '$components/SubmitBtn.svelte'
  import Toaster from '$components/Toaster.svelte'
  import { toast } from '$lib/toast.svelte'

  /**
   * Under Next this called a `'use server'` Server Action. A prerendered site
   * has no such thing, so the form posts JSON to POST /api/contact — the one
   * route in the app that runs on the server, because the Resend key must not
   * reach the browser.
   *
   * The form still has a real `action`/`method`, so it degrades to a normal
   * HTML submission if the JS fails to load.
   */
  let pending = $state(false)
  let formEl = $state<HTMLFormElement | null>(null)

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    if (pending || !formEl) return

    pending = true
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: new FormData(formEl),
      })

      const result = (await response.json().catch(() => ({}))) as {
        error?: string
      }

      if (!response.ok || result.error) {
        toast.error(result.error || 'Something went wrong')
        return
      }

      toast.success('Email sent successfully!')
      formEl.reset()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      )
    } finally {
      pending = false
    }
  }
</script>

<Toaster />

<form
  bind:this={formEl}
  class="space-y-6"
  method="POST"
  action="/api/contact"
  onsubmit={handleSubmit}
>
  <div class="grid gap-6 md:grid-cols-2">
    <div class="space-y-2 text-left">
      <label
        for="senderName"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Your Name
      </label>
      <input
        id="senderName"
        name="senderName"
        type="text"
        required
        maxlength={100}
        placeholder="John Doe"
        class="glass-card special-border focus:ring-primary-500 h-14 w-full border border-gray-200 px-4 text-gray-900 placeholder-gray-500 transition-all duration-300 focus:border-transparent focus:ring-2 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
      />
    </div>

    <div class="space-y-2 text-left">
      <label
        for="senderEmail"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Your Email
      </label>
      <input
        id="senderEmail"
        name="senderEmail"
        type="email"
        required
        maxlength={500}
        placeholder="john@example.com"
        class="glass-card special-border focus:ring-primary-500 h-14 w-full border border-gray-200 px-4 text-gray-900 placeholder-gray-500 transition-all duration-300 focus:border-transparent focus:ring-2 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
      />
    </div>
  </div>

  <div class="space-y-2 text-left">
    <label
      for="message"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      Your Message
    </label>
    <textarea
      id="message"
      name="message"
      placeholder="Hi Pranta, I would like to discuss..."
      required
      maxlength={5000}
      rows={6}
      class="glass-card special-border focus:ring-primary-500 w-full resize-none border border-gray-200 p-4 text-gray-900 placeholder-gray-500 transition-all duration-300 focus:border-transparent focus:ring-2 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
    ></textarea>
  </div>

  <div class="pt-4 text-left">
    <SubmitBtn {pending} />
  </div>
</form>
