import { json, redirect } from '@sveltejs/kit'
import { Resend } from 'resend'

import { env } from '$env/dynamic/private'
import { isContactLabel, mergeConflict, type ContactInput } from '$lib/contact'
import { profile } from '$lib/data/profile'
import { contactFormEmail } from '$lib/server/contact-email'
import { clientAddress, createRateLimiter } from '$lib/server/rate-limit'
import { getErrorMessage } from '$lib/utils'
import type { RequestHandler } from './$types'

// Runtime, not prerendered: RESEND_API_KEY has to stay on the server.
export const prerender = false

// Five pull requests per address per ten minutes is plenty for a person.
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

const text = (value: FormDataEntryValue | unknown) =>
  typeof value === 'string' ? value : ''

/**
 * Accepts the form as JSON (the page's fetch) or as ordinary form data (the
 * same form with JavaScript off). The JSON caller gets JSON back; a plain
 * form post is redirected to a page a browser can show.
 */
export const POST: RequestHandler = async (event) => {
  const { request } = event
  const isJson = request.headers
    .get('content-type')
    ?.includes('application/json')

  let raw: Record<string, unknown>
  try {
    if (isJson) {
      raw = (await request.json()) as Record<string, unknown>
    } else {
      const form = await request.formData()
      raw = { ...Object.fromEntries(form), labels: form.getAll('labels') }
    }
  } catch {
    return json({ error: 'Could not read the form.' }, { status: 400 })
  }

  const respond = (status: number, error?: string) => {
    if (isJson) return json(error ? { error } : { ok: true }, { status })
    redirect(303, error ? '/contact?error=1' : '/contact/merged')
  }

  // Honeypot: a field people never see. Bots that fill it get a cheerful
  // success and nothing is sent.
  if (text(raw.website).trim()) return respond(200)

  const limit = limiter(clientAddress(event))
  if (!limit.ok) {
    if (!isJson) return respond(429, 'rate limited')
    return json(
      {
        error: `Too many pull requests. Try again in ${Math.ceil(limit.retryAfter / 60)} min.`,
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    )
  }

  const input: ContactInput = {
    name: text(raw.name).trim(),
    email: text(raw.email).trim(),
    title: text(raw.title).trim(),
    description: text(raw.description).trim(),
    labels: (Array.isArray(raw.labels) ? raw.labels : []).filter(
      isContactLabel
    ),
  }

  const conflict = mergeConflict(input)
  if (conflict) return respond(400, `conflicts: ${conflict}`)

  if (!env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY is not set')
    return respond(
      503,
      'The inbox is offline right now. Email me directly instead.'
    )
  }

  const { html, text: plain } = contactFormEmail(input)

  try {
    const result = await new Resend(env.RESEND_API_KEY).emails.send({
      from: 'Portfolio PR <onboarding@resend.dev>',
      to: profile.email,
      subject: `PR: ${input.title}`,
      replyTo: input.email,
      html,
      text: plain,
    })

    if (result.error) {
      console.error('[contact] Resend rejected the email:', result.error)
      return respond(
        502,
        'The email service refused the message. Email me directly instead.'
      )
    }

    return respond(200)
  } catch (error: unknown) {
    console.error('[contact]', error)
    return respond(500, getErrorMessage(error))
  }
}
