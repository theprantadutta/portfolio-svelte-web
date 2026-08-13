const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * The contact notification email.
 *
 * This was a @react-email/components template rendered through React. Without
 * React in the stack it is a plain HTML string — which is what @react-email
 * compiled down to anyway. Written with the table-and-inline-styles layout mail
 * clients actually support, and reproducing the previous template's look: light
 * grey page, white card, the same rounded corners as the site's
 * `special-border`.
 */
export const contactFormEmail = ({
  message,
  senderEmail,
  senderName,
}: {
  message: string
  senderEmail: string
  senderName?: string
}) => {
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')
  const safeEmail = escapeHtml(senderEmail)
  const safeName = senderName ? escapeHtml(senderName) : ''

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New message from your portfolio site</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <!-- Preview text -->
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
      New message from your portfolio site
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid rgba(0,0,0,0.1);border-radius:24px 8px 24px 24px;">
            <tr>
              <td style="padding:16px 40px;">
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;font-weight:700;">
                  You received the following message from the contact form
                </h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;white-space:pre-wrap;">${safeMessage}</p>
                <hr style="border:none;border-top:1px solid rgba(0,0,0,0.1);margin:24px 0;" />
                <p style="margin:0;font-size:14px;line-height:1.6;">
                  The sender's email is:
                  <a href="mailto:${safeEmail}" style="color:#0891b2;">${safeEmail}</a>
                </p>
                ${safeName ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.6;">Name: ${safeName}</p>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = [
    'You received the following message from the contact form',
    '',
    message,
    '',
    `The sender's email is: ${senderEmail}`,
    senderName ? `Name: ${senderName}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return { html, text }
}
