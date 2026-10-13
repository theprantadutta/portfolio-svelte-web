/**
 * The seven `~/route` entries shared by the desktop nav, the mobile menu and
 * the command palette. The blog keeps its long-standing /blogs URL (every
 * indexed article lives under it) and is only labelled `~/blog`.
 */

export type RouteId =
  'home' | 'about' | 'projects' | 'open-source' | 'blog' | 'skills' | 'contact'

export interface SiteRoute {
  id: RouteId
  label: string
  href: string
}

export const SITE_ROUTES: SiteRoute[] = [
  { id: 'home', label: '~/home', href: '/' },
  { id: 'about', label: '~/about', href: '/about' },
  { id: 'projects', label: '~/projects', href: '/projects' },
  { id: 'open-source', label: '~/open-source', href: '/open-source' },
  { id: 'blog', label: '~/blog', href: '/blogs' },
  { id: 'skills', label: '~/skills', href: '/skills' },
  { id: 'contact', label: '~/contact', href: '/contact' },
]

/** Which nav entry a path belongs to, or null for the 404 page and friends. */
export const routeFor = (pathname: string): RouteId | null => {
  if (pathname === '/') return 'home'
  const first = pathname.split('/')[1]
  if (first === 'blogs') return 'blog'
  return SITE_ROUTES.some((route) => route.id === first)
    ? (first as RouteId)
    : null
}

/**
 * dev.to slugs end in a random id ("…-in-your-game-26f7"). The breadcrumb
 * shows them as a markdown file without it, the way the design does.
 */
export const postFileName = (slug: string) =>
  `${slug.replace(/-[a-z0-9]{4}$/, '')}.md`
