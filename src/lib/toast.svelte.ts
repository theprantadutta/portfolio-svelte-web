export type ToastKind = 'success' | 'error'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

/**
 * Minimal replacement for react-hot-toast.
 *
 * The site used exactly two calls — `toast.success` and `toast.error` from a
 * single `<Toaster position="top-right" />` — so a 40-line store plus a
 * component reproduces the behaviour without the dependency.
 */
class ToastStore {
  toasts = $state<Toast[]>([])

  #id = 0
  #timers = new Map<number, ReturnType<typeof setTimeout>>()

  #push(kind: ToastKind, message: string, duration = 4000) {
    const id = ++this.#id
    this.toasts = [...this.toasts, { id, kind, message }]
    this.#timers.set(
      id,
      setTimeout(() => this.dismiss(id), duration)
    )
  }

  success = (message: string) => this.#push('success', message)
  error = (message: string) => this.#push('error', message)

  dismiss = (id: number) => {
    clearTimeout(this.#timers.get(id))
    this.#timers.delete(id)
    this.toasts = this.toasts.filter((t) => t.id !== id)
  }
}

export const toast = new ToastStore()
