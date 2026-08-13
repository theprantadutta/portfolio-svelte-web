import { json } from '@sveltejs/kit'
import { Resend } from 'resend'

import { env } from '$env/dynamic/private'
import { contactFormEmail } from '$lib/server/contact-email'
import { getErrorMessage, validateString } from '$lib/utils'
import type { RequestHandler } from './$types'

// The one route in the app that is not a static file. Every page is
// prerendered; this endpoint exists solely because RESEND_API_KEY must stay on
// the server.
export const prerender = false

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData()

  const senderEmail = formData.get('senderEmail')
  const senderName = formData.get('senderName')
  const message = formData.get('message')

  // Same server-side validation the Server Action performed.
  if (!validateString(senderEmail, 500)) {
    return json({ error: 'Invalid sender email' }, { status: 400 })
  }
  if (!validateString(message, 5000)) {
    return json({ error: 'Invalid message' }, { status: 400 })
  }

  const resend = new Resend(env.RESEND_API_KEY)
  const { html, text } = contactFormEmail({
    message,
    senderEmail,
    senderName: typeof senderName === 'string' ? senderName : undefined,
  })

  try {
    const data = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: 'prantadutta1997@gmail.com',
      subject: 'Message from contact form',
      replyTo: senderEmail,
      html,
      text,
    })

    if (data.error) {
      console.error(data.error)
      return json({ error: data.error.message }, { status: 502 })
    }

    return json({ data: data.data })
  } catch (error: unknown) {
    console.error(error)
    return json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
