/**
 * enhanced-img only declares `*?enhanced`. Imports that also pick widths put
 * `enhanced` last (`avatar.png?w=192;96&enhanced`) so this one pattern types
 * them all.
 */
declare module '*&enhanced' {
  const value: import('vite-imagetools').Picture
  export default value
}
