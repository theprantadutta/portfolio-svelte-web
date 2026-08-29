/**
 * Permanent URL for the CV.
 *
 * Deliberately not the PDF's own filename. A dated file like
 * /PRANTA_CV_SEPTEMBER_2026.pdf changes URL every time the CV is revised,
 * which breaks every link already handed to a recruiter. This route is stable
 * forever and always serves whatever the current CV is.
 */
export const CV_PATH = '/download-cv'

/**
 * The name the downloaded file is saved as — the one thing that should still
 * carry a date, so a recruiter's downloads folder shows which revision it is.
 *
 * To publish a new CV: replace src/lib/assets/cv.pdf and update this string.
 * Nothing else changes, and the public URL stays put.
 */
export const CV_DOWNLOAD_FILENAME = 'PRANTA_CV_SEPTEMBER_2026.pdf'

/**
 * PD Labs — the services site. A separate property on its own subdomain, so it
 * opens in a new tab rather than navigating the portfolio away from itself.
 */
export const SERVICES_LINK = 'https://pdlabs.pranta.dev'

export const LINKED_IN_LINK = 'https://www.linkedin.com/in/theprantadutta/'

export const GITHUB_LINK = 'https://github.com/theprantadutta/'

export const X_LINK = 'https://x.com/theprantadutta'
