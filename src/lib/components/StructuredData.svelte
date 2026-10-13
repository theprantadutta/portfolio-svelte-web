<script lang="ts">
  import { profile, socials } from '#lib/data/profile.js'
  import { SITE_URL } from '#lib/site.js'

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: `${profile.role} with ${profile.years} years of experience building production mobile apps, backend APIs and AI-powered systems.`,
    url: SITE_URL,
    image: `${SITE_URL}/profile.png`,
    email: profile.email,
    sameAs: socials
      .filter((social) => social.id !== 'email')
      .map((social) => social.url),
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.city,
      addressCountry: 'BD',
    },
    knowsAbout: [
      'Flutter',
      'Dart',
      'React Native',
      'ASP.NET Core',
      'Go',
      'TypeScript',
      'Mobile Development',
      'Backend Development',
      'LLM Integrations',
      'DevOps',
    ],
  }

  // A literal `<` in the payload could close the tag early once inlined, so
  // escape it. Written with split/join rather than a regex literal: the Svelte
  // parser scans script bodies for the closing tag and mis-reads a `/</` regex.
  const json = JSON.stringify(structuredData).split('<').join('\\u003c')

  // Assembled by concatenation for the same reason — neither the Svelte nor
  // the ESLint parser should see a literal script tag inside this block.
  const tag =
    '<' + 'script type="application/ld+json">' + json + '<' + '/script>'
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- static, escaped above -->
  {@html tag}
</svelte:head>
