import type { ContactInput } from '#lib/contact.js'

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const LABEL_COLORS: Record<string, string> = {
  freelance: '#2f9e5f',
  'full-time': '#1e8fc4',
  consulting: '#8a63cf',
  'open-source': '#d0702f',
  'just-saying-hi': '#c2493f',
}

/**
 * The notification for a "pull request" from /contact, styled like one: the
 * title as the heading, labels as coloured chips, the description as the
 * body. Plain tables and inline styles, which is what mail clients render.
 */
export const contactFormEmail = ({
  name,
  email,
  title,
  description,
  labels,
}: ContactInput) => {
  const safeTitle = escapeHtml(title)
  const safeEmail = escapeHtml(email)
  const safeName = escapeHtml(name || 'Someone')
  const safeDescription = description
    ? escapeHtml(description).replace(/\n/g, '<br />')
    : '<span style="color:#9a9a94;">No description provided.</span>'

  const chips = labels
    .map(
      (label) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:3px 10px;border-radius:999px;border:1px solid ${LABEL_COLORS[label]};color:${LABEL_COLORS[label]};font-family:Menlo,Consolas,monospace;font-size:12px;">${escapeHtml(label)}</span>`
    )
    .join('')

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#fafaf8;color:#15171c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
      ${safeName} opened a pull request: ${safeTitle}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf8;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e4e4df;border-radius:18px;">
            <tr>
              <td style="padding:14px 24px;border-bottom:1px solid #eeeeea;font-family:Menlo,Consolas,monospace;font-size:12px;color:#6b6b66;">
                base: pranta/inbox &larr; compare: ${safeEmail} &nbsp;<span style="color:#2f8a55;">&#10003; able to merge</span>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:700;">${safeTitle}</h1>
                ${chips ? `<div style="margin:0 0 10px;">${chips}</div>` : ''}
                <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#33352f;">${safeDescription}</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#55574f;">
                  From <b>${safeName}</b> &middot; <a href="mailto:${safeEmail}" style="color:#1e7fb0;">${safeEmail}</a>
                </p>
                <p style="margin:6px 0 0;font-size:12px;color:#9a9a94;">Reply to this email to answer them directly.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = [
    `PR: ${title}`,
    labels.length ? `Labels: ${labels.join(', ')}` : '',
    '',
    description || 'No description provided.',
    '',
    `From: ${name || 'Someone'} <${email}>`,
  ]
    .filter((line, i, all) => line !== '' || all[i - 1] !== '')
    .join('\n')

  return { html, text }
}
