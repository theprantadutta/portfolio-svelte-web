import {
  faApple,
  faGithub,
  faGooglePlay,
  faLinkedinIn,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons'

// Brand marks from Font Awesome Free, rendered by BrandIcon.svelte. Lucide no
// longer ships brand logos, and Simple Icons dropped LinkedIn's.
//
// The package's own license banner is tree-shaken away along with every icon
// we don't use, and the Svelte compiler drops comments, so this table lives in
// a plain module: the `/*!` comment below is kept by the bundler and carries
// the CC BY 4.0 attribution into the built JavaScript.

/*! Font Awesome Free by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0) */
export const BRAND_ICONS = {
  github: faGithub,
  linkedin: faLinkedinIn,
  x: faXTwitter,
  'google-play': faGooglePlay,
  apple: faApple,
}

export type BrandName = keyof typeof BRAND_ICONS | 'email'
