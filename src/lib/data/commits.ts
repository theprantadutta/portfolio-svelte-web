/**
 * The home page's `git log --graph`: a career told as commits.
 *
 * Lanes are fixed columns. `main` is the day job, `oss` and `writing` are
 * side branches that only run through the rows where they are active and then
 * merge back into main. Newest first. Hashes are not stored: they are derived
 * from the message (see `shortHash`), so they stay stable and look real.
 *
 * `{posts}` and `{prs}` are filled in at build time from dev.to and the
 * open-source data.
 */

export type Lane = 'main' | 'oss' | 'writing'

export interface Commit {
  type: string
  message: string
  tag: string
  lane: Lane
  year: string
  /** Shown when the row is expanded. */
  detail: string
  href: string
  linkLabel: string
}

export const commits: Commit[] = [
  {
    type: 'feat(ai):',
    message: 'OpenAI-compatible gateway + MCP servers on live factory data',
    tag: 'HEAD',
    lane: 'main',
    year: '2026',
    detail:
      'KDS Lens is an OpenAI-compatible gateway with schema-constrained JSON extraction, per-project keys, model failover and request replay. Kai is a Gemini + MCP assistant with 28 tools that answers questions across three factory systems.',
    href: '/projects/kds-lens',
    linkLabel: 'view KDS Lens',
  },
  {
    type: 'merge:',
    message: 'PRs merged into flutter/flutter, devtools and packages',
    tag: 'oss',
    lane: 'oss',
    year: '2026',
    detail:
      '{prs} merged pull requests across the Flutter framework, DevTools, Flutter packages, Supabase, Sentry and the React Native docs, each reviewed and shipped by the maintainers.',
    href: '/open-source',
    linkLabel: 'view the PRs',
  },
  {
    type: 'docs:',
    message: '125,000+ article views across {posts} posts',
    tag: 'writing',
    lane: 'writing',
    year: '2026',
    detail:
      'Notes from shipping: game monetisation, Flutter internals, AI-assisted code review and the occasional rant, published on dev.to.',
    href: '/blogs',
    linkLabel: 'read the blog',
  },
  {
    type: 'perf:',
    message: 'KDS Portal — HR processing time ↓ 40% for 20k employees',
    tag: 'prod',
    lane: 'main',
    year: '2024',
    detail:
      'A Flutter HRM app on Android, iOS and desktop web over a .NET API that bridges the legacy ERP: attendance, leave, payroll and loans, with biometric re-authentication guarding salary data.',
    href: '/projects/kds-portal',
    linkLabel: 'view KDS Portal',
  },
  {
    type: 'release:',
    message: 'KDS Zakat — NFC distribution, fraud ↓ 99.99%',
    tag: 'nfc',
    lane: 'main',
    year: '2024',
    detail:
      'Offline-first NFC-card distribution for 20,000+ employees, with background sync and duplicate-read detection.',
    href: '/projects/kds-zakat',
    linkLabel: 'view KDS Zakat',
  },
  {
    type: 'init:',
    message: 'joined KDS Group as primary developer',
    tag: 'v0.1',
    lane: 'main',
    year: '2022',
    detail:
      'The start of 16+ production systems for a garment manufacturer: mobile, web, APIs, IoT firmware and the infrastructure under them.',
    href: '/skills',
    linkLabel: 'view experience',
  },
]

/** Lanes in column order, left to right. */
export const LANES: Lane[] = ['main', 'oss', 'writing']
