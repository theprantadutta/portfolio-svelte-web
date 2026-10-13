/**
 * The contact form's shape and rules, shared by the page (live "able to
 * merge" status) and POST /api/contact (the authority).
 */

export const CONTACT_LABELS = [
  { id: 'freelance', tone: 'green' },
  { id: 'full-time', tone: 'blue' },
  { id: 'consulting', tone: 'purple' },
  { id: 'open-source', tone: 'orange' },
  { id: 'just-saying-hi', tone: 'red' },
] as const

export type ContactLabel = (typeof CONTACT_LABELS)[number]['id']

export const DEFAULT_LABELS: ContactLabel[] = ['full-time']

export interface ContactInput {
  name: string
  email: string
  title: string
  description: string
  labels: ContactLabel[]
}

export const LIMITS = {
  name: 100,
  email: 254,
  title: 120,
  description: 5000,
} as const

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const isContactLabel = (value: unknown): value is ContactLabel =>
  CONTACT_LABELS.some((label) => label.id === value)

/**
 * The first reason the "pull request" can't merge, phrased as a git
 * conflict, or null when it can.
 */
export const mergeConflict = (
  input: Pick<ContactInput, 'email' | 'title' | 'name' | 'description'>
) => {
  const email = input.email.trim()
  if (!email) return 'email required'
  if (email.length > LIMITS.email || !EMAIL.test(email))
    return 'email looks invalid'
  if (input.title.trim().length < 4) return 'title needs 4+ characters'
  if (input.title.length > LIMITS.title)
    return `title over ${LIMITS.title} characters`
  if (input.name.length > LIMITS.name)
    return `name over ${LIMITS.name} characters`
  if (input.description.length > LIMITS.description) {
    return `description over ${LIMITS.description} characters`
  }
  return null
}
