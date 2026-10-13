/**
 * Which overlay is open. A module singleton rather than context because the
 * keyboard shortcuts, the nav and the overlays themselves all live in
 * different branches of the layout. Only ever written in the browser, so the
 * server never holds per-visitor state here.
 */
class UiState {
  menuOpen = $state(false)
  paletteOpen = $state(false)
  /** Where the mobile menu's circular reveal grows from. */
  menuOrigin = $state({ x: 0, y: 0 })

  openMenu = (origin: { x: number; y: number }) => {
    this.menuOrigin = origin
    this.menuOpen = true
  }

  closeMenu = () => {
    this.menuOpen = false
  }

  openPalette = () => {
    this.menuOpen = false
    this.paletteOpen = true
  }

  closePalette = () => {
    this.paletteOpen = false
  }
}

export const ui = new UiState()
