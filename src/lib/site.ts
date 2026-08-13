/**
 * The site's canonical public origin.
 *
 * Absolute URLs are required in sitemaps and llms.txt (relative ones are
 * ignored by crawlers), and it has to match the `<link rel="canonical">` tags
 * and the OpenGraph URLs already hardcoded across the routes — so it lives in
 * one place rather than being re-typed per file.
 */
export const SITE_URL = 'https://pranta.dev'

export const SITE_NAME = 'Pranta Dutta'

export const SITE_DESCRIPTION =
  'Pranta Dutta is a Flutter & Mobile Engineer with 4+ years of experience building production apps, backend APIs, and AI-powered systems.'
