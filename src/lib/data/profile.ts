import { CV_PATH, SERVICES_LINK } from '#lib/constants/selectors.js'

/**
 * Who Pranta is and how to reach him: the copy that appears across several
 * pages. Page-specific copy lives with its page's data file; anything marked
 * "confirm" below is listed in TODO_CONTENT.md.
 *
 * Strings that render with {@html} (marked `Html`) may contain <b> and <code>
 * only. They are authored here, never user input.
 */

export const profile = {
  name: 'Pranta Dutta',
  handle: 'pranta',
  role: 'Flutter & Mobile Engineer',
  years: '4+',
  location: 'Chattogram, Bangladesh',
  city: 'Chattogram',
  timezone: 'UTC+6',
  site: 'pranta.dev',
  email: 'prantadutta1997@gmail.com',

  /**
   * Flip to false when not looking. Drives the pulsing status line on the
   * home page, the "open" meta in the mobile menu and the availability card
   * on /contact.
   */
  openToWork: true,
  status: 'open to remote roles',
  availability: 'Open to remote full-time and freelance work',
  /** Shown on /contact under the form. */
  responseTime: 'usually reviewed within 24h',

  cvPath: CV_PATH,
  servicesUrl: SERVICES_LINK,
} as const

export interface Social {
  id: 'github' | 'linkedin' | 'x' | 'email'
  name: string
  handle: string
  url: string
}

export const socials: Social[] = [
  {
    id: 'github',
    name: 'GitHub',
    handle: '@theprantadutta',
    url: 'https://github.com/theprantadutta',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: '/in/theprantadutta',
    url: 'https://www.linkedin.com/in/theprantadutta/',
  },
  {
    id: 'x',
    name: 'X',
    handle: '@theprantadutta',
    url: 'https://x.com/theprantadutta',
  },
  {
    id: 'email',
    name: 'Email',
    handle: profile.email,
    url: `mailto:${profile.email}`,
  },
]

/** The three numbers under the activity heatmap on the home page. */
export const heroStats = [
  // From the CV: Snake Classic 10,000+ and PinPoint 1,000+ downloads.
  { value: 11, suffix: 'k+', label: 'downloads' },
  // KDS Portal's workforce. "daily" is the design's wording: confirm.
  { value: 20, suffix: 'k+', label: 'daily users' },
  // dev.to's stats page is not public, so this cannot be computed: confirm.
  { value: 125, suffix: 'k', label: 'article views' },
] as const

export const home = {
  headline: 'Four years of commits.',
  /** `{n}` is the number of projects on the site. */
  headlineAccent: '{n} apps in production.',
  headlineAccentShort: '{n} apps shipped.',
  lead: "I'm Pranta, a Flutter & mobile engineer. I build the apps, the APIs and the infra between them, and I've had code merged into the Flutter SDK.",
  leadShort:
    'Flutter & mobile engineer. Apps, APIs and the infra between them.',
  /**
   * The three phones fanned behind the heatmap on desktop: left, centre,
   * right, by project slug. Each shows its project's first screenshot in the
   * CMS's order; a project without screenshots is skipped.
   */
  heroPhones: ['pinpoint', 'snake-classic', 'odyssey'],
}

/** /about, rendered as a README. */
export const readme = {
  title: "Hi, I'm Pranta Dutta",
  subtitle: `${profile.role} · ${profile.years} years`,
  /** The README's own last edit, shown in the card header. Update with it. */
  editedAt: '2026-10-13',
  introHtml:
    'I build <b>mobile apps, backend APIs and the infrastructure</b> that connects them. My core stack is <code>Flutter, React Native, Go &amp; .NET</code>.',
  winsTitle: 'Systems that moved numbers',
  wins: [
    {
      value: '−99.99%',
      label: 'fraud in an NFC distribution app',
      tone: 'green',
      href: '/projects/kds-zakat',
    },
    {
      value: '−40%',
      label: 'HR processing time (KDS Portal)',
      tone: 'blue',
      href: '/projects/kds-portal',
    },
    {
      value: '−80%',
      label: 'inspection delays (KDS QMS)',
      tone: 'purple',
      href: '/projects/kds-qms',
    },
  ],
  nowTitle: 'Right now',
  nowHtml:
    'Deep into <b>AI/LLM integrations</b>. I built an OpenAI-compatible AI gateway and production assistants using <code>MCP servers, Gemini, OpenAI &amp; Claude</code> that answer questions from live factory data. I also run my own DevOps on a Hetzner VPS with Docker, Traefik, GitLab CI/CD and automated backups.',
  bio: 'Mobile, backend and infra engineer. Flutter SDK contributor. Writes about shipping.',
} as const

/**
 * The "Releases" card on /about. `{prs}` and `{apps}` are filled in from the
 * open-source data and the CMS so they cannot drift from the pages that list
 * them.
 */
export const releases = [
  { value: '16+', label: 'in-house systems used by 20,000+ people' },
  { value: '{apps}', label: 'public apps, 11,000+ downloads' },
  { value: '{prs}', label: 'merged open-source PRs' },
  { value: '40', label: 'CI/CD pipelines, 17 self-hosted services' },
  { value: '125k', label: 'article views' },
]
