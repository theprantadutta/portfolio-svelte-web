export type ToastKind = 'info' | 'success' | 'error'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

/**
 * Bottom-centre mono toasts (MOTION §4 "Toasts"): "link copied", "email
 * copied", form errors. Short confirmations clear after 2.2s; errors stay
 * longer so they can be read.
 */
class ToastStore {
  toasts = $state<Toast[]>([])

  #id = 0
  #timers = new Map<number, ReturnType<typeof setTimeout>>()

  #push(kind: ToastKind, message: string, duration: number) {
    const id = ++this.#id
    this.toasts = [...this.toasts.slice(-2), { id, kind, message }]
    this.#timers.set(
      id,
      setTimeout(() => this.dismiss(id), duration)
    )
  }

  show = (message: string) => this.#push('info', message, 2200)
  success = (message: string) => this.#push('success', message, 2200)
  error = (message: string) => this.#push('error', message, 5000)

  dismiss = (id: number) => {
    clearTimeout(this.#timers.get(id))
    this.#timers.delete(id)
    this.toasts = this.toasts.filter((t) => t.id !== id)
  }
}

export const toast = new ToastStore()

/** Copies text and confirms with a toast; reports failure the same way. */
export const copyText = async (text: string, confirmation: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.show(confirmation)
  } catch {
    toast.error('Could not copy. Your browser blocked clipboard access.')
  }
}
