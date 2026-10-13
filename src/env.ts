import { defineEnvVars } from '@sveltejs/kit/env'

/**
 * Every environment variable the app reads, imported from `$app/env/public`
 * or `$app/env/private`. See `.env.example` for what each one is for.
 *
 * The private ones are optional and default to the empty string, which every
 * reader treats as "not configured": the contact form and reactions answer
 * 503, the heatmap keeps its build-time data, Strapi calls use the public URL.
 * The build itself must not fail on a missing token — GitHub falls back to the
 * committed snapshot.
 */
const optional = (input: string | undefined) => input ?? ''

export const variables = defineEnvVars({
  PUBLIC_STRAPI_DEV_API_URL: {
    public: true,
    static: true,
    description: 'Public Strapi origin in development.',
  },
  PUBLIC_STRAPI_PROD_API_URL: {
    public: true,
    static: true,
    description:
      'Public Strapi origin in production, baked into the bundle and the prerendered HTML.',
  },
  STRAPI_API_KEY: {
    schema: optional,
    description: 'Read-only Strapi token. Only the build needs it.',
  },
  STRAPI_INTERNAL_URL: {
    schema: optional,
    description:
      'Strapi on the Docker network, for runtime calls. Falls back to the public origin.',
  },
  STRAPI_REACTIONS_TOKEN: {
    schema: optional,
    description: 'Strapi token allowed only to read and write post reactions.',
  },
  RESEND_API_KEY: {
    schema: optional,
    description: 'Delivers the contact form.',
  },
  GITHUB_TOKEN: {
    schema: optional,
    description:
      'GitHub GraphQL access for the heatmap, PR sizes and languages. Falls back to the snapshot.',
  },
})
