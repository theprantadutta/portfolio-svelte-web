import { createHash } from 'node:crypto'

// `?inline` makes Vite emit the PDF as a base64 data URL bundled into this
// module, rather than a hashed file on disk. That matters: the bytes travel
// with the server chunk, so serving them needs no filesystem path that could
// differ between `vite preview` and the Docker image.
import cvDataUrl from '$lib/assets/cv.pdf?inline'

import { CV_DOWNLOAD_FILENAME } from '$lib/constants/selectors'
import type { RequestHandler } from './$types'

/**
 * A permanent URL for the CV: https://pranta.dev/download-cv
 *
 * The problem this solves is that a dated filename makes a dated URL, so every
 * revision breaks the link already sitting in a recruiter's inbox or an
 * application form. This route never changes; the file behind it does.
 *
 * It cannot be prerendered. Prerendering writes the response body to a file
 * and lets the static server re-derive the headers from the extension, which
 * would drop the Content-Disposition below — and that header is the entire
 * point, since it is what makes the browser save the file under the dated name
 * instead of opening a PDF viewer on a URL called "download-cv".
 */
export const prerender = false

const pdf = Buffer.from(cvDataUrl.split(',')[1], 'base64')

// Content-addressed, so a revised CV invalidates caches on its own and an
// unchanged one answers repeat requests with a 304.
const etag = `"${createHash('sha256').update(pdf).digest('hex').slice(0, 32)}"`

export const GET: RequestHandler = async ({ request }) => {
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } })
  }

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      // `attachment` forces a save rather than an inline viewer, and filename
      // restores the dated name the URL no longer carries.
      'Content-Disposition': `attachment; filename="${CV_DOWNLOAD_FILENAME}"`,
      'Content-Length': String(pdf.byteLength),
      ETag: etag,
      // Revalidate every time. The URL is stable but its contents are not, and
      // a recruiter opening a months-old link must not get a cached old CV.
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
