import type { TocEntry } from '#components/blog/posts.js'

/**
 * Reshapes dev.to's rendered article HTML for the post page.
 *
 * dev.to's `body_html` is built for dev.to: every code block carries a
 * fullscreen-toggle panel of inline SVGs, headings are empty `<a name>`
 * anchors in front of the text, and images and embeds load eagerly. This
 * turns it into what the redesign renders: code blocks with a header row
 * and a copy button, headings with real ids and a hover `#` link, and a
 * table of contents to go with them.
 *
 * Runs on the server (at build time, or once on demand for a post newer than
 * the build), so the browser receives finished HTML and only wires up the
 * copy buttons. String processing rather than a DOM parser: the input is
 * dev.to's own consistent output, and the transforms are local.
 */

export interface ProcessedArticle {
  html: string
  toc: TocEntry[]
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

export const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const value =
        code[1] === 'x' || code[1] === 'X'
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10)
      return Number.isFinite(value) ? String.fromCodePoint(value) : match
    }
    return ENTITIES[code.toLowerCase()] ?? match
  })

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const stripTags = (html: string) => html.replace(/<[^>]*>/g, '')

/**
 * Removes every `<div class="…{className}…">` element including its nested
 * divs, by counting opening and closing div tags from the match onward.
 */
const removeDivs = (html: string, className: string) => {
  const opener = new RegExp(
    `<div class="[^"]*\\b${className}\\b[^"]*"[^>]*>`,
    'g'
  )
  let out = ''
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = opener.exec(html))) {
    out += html.slice(cursor, match.index)
    const tags = /<div\b[^>]*>|<\/div>/g
    tags.lastIndex = match.index + match[0].length
    let depth = 1
    let tag: RegExpExecArray | null
    while (depth > 0 && (tag = tags.exec(html))) {
      depth += tag[0] === '</div>' ? -1 : 1
    }
    cursor = depth === 0 ? tags.lastIndex : html.length
    opener.lastIndex = cursor
  }

  return out + html.slice(cursor)
}

/** dev.to's language ids, as a reader would name them in the header. */
const LANGUAGE_NAMES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'shell',
  bash: 'shell',
  shell: 'shell',
  console: 'shell',
  plaintext: 'text',
  text: 'text',
  yml: 'yaml',
  cs: 'c#',
  csharp: 'c#',
  dockerfile: 'dockerfile',
}

const codeBlocks = (html: string) =>
  html.replace(
    /<div class="highlight[^"]*">\s*(<pre class="highlight\s*([\w#+-]*)"[^>]*>[\s\S]*?<\/pre>)\s*<\/div>/g,
    (_match, pre: string, rawLanguage: string) => {
      const language = LANGUAGE_NAMES[rawLanguage] ?? (rawLanguage || 'text')
      return (
        `<figure class="code-block" data-lang="${escapeAttr(language)}">` +
        `<figcaption class="code-head"><span class="code-lang">${escapeAttr(language)}</span>` +
        `<button type="button" class="code-copy" data-copy aria-label="Copy code">` +
        `<span class="copy-idle">copy</span><span class="copy-done" aria-hidden="true">copied ✓</span></button>` +
        `</figcaption>${pre}</figure>`
      )
    }
  )

/**
 * Gives every heading a real id (from dev.to's anchor name), replaces the
 * empty anchor with a `#` link the page reveals on hover, and shifts levels
 * so the post's top heading level is h2: the page's own h1 is the title.
 */
const headings = (html: string, toc: TocEntry[]) => {
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]))
  const shift = levels.length ? 2 - Math.min(...levels) : 0
  const used = new Set<string>()

  return html.replace(
    /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g,
    (_match, rawLevel: string, inner: string) => {
      const level = Math.min(Math.max(Number(rawLevel) + shift, 2), 6)
      const anchor = /<a\s+name="([^"]+)"[^>]*>\s*<\/a>/.exec(inner)
      const content = inner
        .replace(/<a\s+name="[^"]+"[^>]*>\s*<\/a>/, '')
        .trim()
      const text = decodeEntities(stripTags(content))
        .replace(/\s+/g, ' ')
        .trim()

      let id =
        anchor?.[1] ??
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      if (!id) id = 'section'
      let unique = id
      for (let n = 2; used.has(unique); n++) unique = `${id}-${n}`
      used.add(unique)

      if (level === 2 || level === 3) toc.push({ id: unique, text, level })

      return (
        `<h${level} id="${escapeAttr(unique)}">` +
        `<a class="heading-anchor" href="#${escapeAttr(unique)}" aria-label="Copy link to “${escapeAttr(text)}”">#</a>` +
        `${content}</h${level}>`
      )
    }
  )
}

const media = (html: string) =>
  html
    // Every image and embed waits until it is near the viewport, and never
    // competes with the cover (the page's LCP) for bandwidth.
    .replace(/<img\b(?![^>]*\bloading=)/g, '<img loading="lazy"')
    .replace(/<img\b(?![^>]*\bdecoding=)/g, '<img decoding="async"')
    .replace(/<img\b(?![^>]*\bfetchpriority=)/g, '<img fetchpriority="low"')
    .replace(/<iframe\b(?![^>]*\bloading=)/g, '<iframe loading="lazy"')
    // Wide tables scroll inside the column instead of widening the page.
    .replace(/<table\b/g, '<div class="table-wrap"><table')
    .replace(/<\/table>/g, '</table></div>')

/**
 * Every link that leaves the site (GitHub, docs, other dev.to posts) opens in
 * a new tab, like every other external link on the site. In-page `#` links
 * and links back to pranta.dev stay in the tab.
 */
const externalLinks = (html: string) =>
  html.replace(/<a\b([^>]*)>/g, (tag, attributes: string) => {
    const href = /\bhref="([^"]*)"/.exec(attributes)?.[1] ?? ''
    const external =
      /^(https?:)?\/\//i.test(href) &&
      !/^(https?:)?\/\/(www\.)?pranta\.dev\b/i.test(href)
    if (!external || /\btarget=/.test(attributes)) return tag
    // Keep whatever rel dev.to set (e.g. nofollow) and add the new-tab pair.
    const existing = /\brel="([^"]*)"/.exec(attributes)?.[1].split(/\s+/) ?? []
    const rel = [...new Set([...existing, 'noopener', 'noreferrer'])]
      .filter(Boolean)
      .join(' ')
    const rest = attributes.replace(/\s*\brel="[^"]*"/, '')
    return `<a${rest} target="_blank" rel="${rel}">`
  })

export const processArticleHtml = (bodyHtml: string): ProcessedArticle => {
  const toc: TocEntry[] = []
  let html = removeDivs(bodyHtml, 'highlight__panel')
  html = codeBlocks(html)
  html = headings(html, toc)
  html = media(html)
  html = externalLinks(html)
  return { html, toc }
}

/** Words of prose in the post's markdown, leaving out code blocks. */
export const countWords = (markdown: string) =>
  markdown
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length
