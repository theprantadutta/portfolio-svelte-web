// Every route in this app is prerendered to a static HTML file at build time.
// Declaring it once at the root applies it to the whole tree; the only thing
// left dynamic is POST /api/contact, which is an endpoint rather than a page.
export const prerender = true

// Client-side routing is on (the default). Navigations after the first paint
// fetch just the next page's data and patch the DOM, so the shell, CSS and
// fonts are never re-downloaded.
export const ssr = true
