// Scroll-triggered reveals are deliberately NOT here: they are pure CSS (the
// `reveal` utility in app.css, driven by `animation-timeline: view()`). Gating
// visibility on JS meant a failed observer left content invisible forever.

type Phase = 'entering' | 'entered' | 'exiting' | 'exited'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Mount/unmount transition for the modals, ported from `useModalAnimation`.
 *
 * Call `set(isOpen)` from an effect. `shouldRender` stays true through the exit
 * animation so the modal can fade out before it leaves the DOM.
 */
export class ModalAnimation {
  shouldRender = $state(false)
  animationPhase = $state<Phase>('exited')

  #timer: ReturnType<typeof setTimeout> | undefined

  set(isOpen: boolean) {
    clearTimeout(this.#timer)

    if (isOpen) {
      this.shouldRender = true
      this.animationPhase = 'entering'
      this.#timer = setTimeout(() => {
        this.animationPhase = 'entered'
      }, 10)
    } else {
      if (!this.shouldRender) {
        this.animationPhase = 'exited'
        return
      }
      this.animationPhase = 'exiting'
      this.#timer = setTimeout(() => {
        this.shouldRender = false
        this.animationPhase = 'exited'
      }, 300)
    }
  }

  destroy() {
    clearTimeout(this.#timer)
  }

  get overlayClassName() {
    if (prefersReducedMotion()) {
      return 'fixed inset-0 bg-black/50 z-50'
    }

    switch (this.animationPhase) {
      case 'entering':
        return 'fixed inset-0 bg-black/0 z-50 transition-all duration-300 ease-out'
      case 'entered':
        return 'fixed inset-0 bg-black/50 z-50 transition-all duration-300 ease-out'
      case 'exiting':
        return 'fixed inset-0 bg-black/0 z-50 transition-all duration-300 ease-out'
      default:
        return 'fixed inset-0 bg-black/0 z-50'
    }
  }

  modalClassName(baseClasses: string = '') {
    if (prefersReducedMotion()) {
      return `${baseClasses} transform transition-none`
    }

    switch (this.animationPhase) {
      case 'entering':
        return `${baseClasses} transform transition-all duration-300 ease-out scale-95 opacity-0 translate-y-4`
      case 'entered':
        return `${baseClasses} transform transition-all duration-300 ease-out scale-100 opacity-100 translate-y-0`
      case 'exiting':
        return `${baseClasses} transform transition-all duration-300 ease-out scale-95 opacity-0 translate-y-4`
      default:
        return `${baseClasses} transform scale-95 opacity-0`
    }
  }
}
