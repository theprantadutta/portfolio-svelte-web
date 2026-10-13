# TODO_CONTENT.md

Content the "Commit Log" redesign needs Pranta to confirm or fill in. Real data
replaced every placeholder in the design handoff wherever the CV, the CMS,
dev.to or GitHub had it. What is left is below, with where each item lives.

## 1. Confirm (copy that could not be verified)

| What                     | Current value                                                                                                                                                                                   | Where                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Hero stats               | `11k+ downloads` · `20k+ daily users` · `125k article views`                                                                                                                                    | `src/lib/data/profile.ts` → `heroStats`                                                           |
| "daily users"            | The CV says "serving 20,000+ users"; the design says "daily". Pick one.                                                                                                                         | same                                                                                              |
| Article views            | `125k` / `125,000+` (dev.to's stats aren't public, so it can't be computed)                                                                                                                     | `heroStats`, `releases`, `commits.ts` (docs row), blog eyebrow in `src/routes/blogs/+page.svelte` |
| Releases card            | `16+` systems, `11,000+` downloads, `40` CI/CD pipelines, `17` self-hosted services                                                                                                             | `profile.ts` → `releases` (the app and PR counts are computed)                                    |
| "Right now" paragraph    | AI/LLM work + "my own DevOps on a Hetzner VPS…"                                                                                                                                                 | `profile.ts` → `readme.nowHtml`                                                                   |
| README "last edited"     | `2026-10-13`. Bump it when the README copy changes.                                                                                                                                             | `profile.ts` → `readme.editedAt`                                                                  |
| Status line              | `open to remote roles · Chattogram, UTC+6`. The design said Dhaka; the CV says Chattogram.                                                                                                      | `profile.ts` (`status`, `city`)                                                                   |
| Open to work             | `openToWork: true` drives the home status line, the menu's "open" and the /contact availability card                                                                                            | `profile.ts`                                                                                      |
| Home commit graph        | Tags `nfc`, `prod`, `v0.1`; the `init:` row "joined KDS Group as primary developer" (2022) replaces the design's "first Flutter app shipped to production (2021)", which the CV doesn't support | `src/lib/data/commits.ts`                                                                         |
| Hero headline            | "25 apps in production." The number is the count of visible CMS projects, which includes two still in progress (FreeWay, DeadBounce).                                                           | `profile.ts` → `home.headlineAccent`                                                              |
| Skills: daily drivers    | Go, PostgreSQL and React Native are marked daily (as in the design)                                                                                                                             | `src/lib/data/skills.ts`                                                                          |
| Skills: Web group        | Not in the design. It holds TypeScript, Angular, Next.js, Svelte and React from the CV. Keep or fold into Backend?                                                                              | `skills.ts`                                                                                       |
| Experience: indie branch | "Indie developer · 2021 — now". The start year comes from the design.                                                                                                                           | `src/routes/skills/`                                                                              |

## 2. Fill in the CMS (needs the CMS deploy first)

The redesign added three optional fields to **Project** in Strapi: `metric`,
`impactStats` (up to 3 × value/label/highlight) and `changelog` (type/message/date).
Projects without them render fine; the pinned card and Impact panel just show
less. Suggested values, all taken from the CV:

| Project       | metric           | impactStats                                         |
| ------------- | ---------------- | --------------------------------------------------- |
| kds-portal    | `−40% HR time`   | `20k+` employees · `−40%` HR processing (highlight) |
| kds-zakat     | `fraud −99.99%`  | `20k+` employees · `−99.99%` fraud (highlight)      |
| kds-qms       | `−80% delays`    | `−80%` inspection delays (highlight)                |
| project-argus | `40 handhelds`   | `40` Zebra handhelds · `43` test files              |
| kai           | `28 MCP tools`   | `28` tools · `3` factory systems                    |
| snake-classic | `10k+ downloads` | `10k+` downloads · `5.3k+` active installs          |
| pinpoint      | `1k+ downloads`  | `1k+` downloads                                     |
| freeway       | `8 AI providers` | `8` providers                                       |

Changelogs need real dates, so only you can write them. Without one, a
project shows "init: first commit" (start date) and "release: … shipped"
(end date).

## 3. Fix in the CMS (data errors)

- **filefly-cli**: end date `2024-08-22` is before its start date `2025-06-26`.
- **pulse**: end date `2024-07-19` is before its start date `2025-09-06`.
- **remind-me** (hidden): end date `2024-05-17` is before its start date `2025-04-09`.

The site shows only the start date for these, and no "shipped" changelog row.

## 4. Assets

- **Avatar**: `src/lib/assets/avatar.png` is a square crop of
  `profile_studio_gibli.png` framed like the design. Replace it if you want a
  different crop (keep it square, ≥512px). `avatar-og.png` is the 128px copy
  used on share cards.
- **Project screenshots**: the gallery shows only real screenshots. A project
  with fewer than three shows fewer phones; upload more in Strapi to fill it.
