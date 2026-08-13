<script lang="ts">
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Pranta Dutta',
    jobTitle: 'Full Stack Developer',
    description:
      'Skilled full-stack developer with 3+ years of experience in Flutter, React Native, and modern web technologies.',
    url: 'https://pranta.dev',
    image: 'https://pranta.dev/profile.png',
    sameAs: [
      'https://github.com/prantadutta',
      'https://linkedin.com/in/prantadutta',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bangladesh',
    },
    email: 'prantadutta1997@gmail.com',
    knowsAbout: [
      'Flutter',
      'React Native',
      'JavaScript',
      'TypeScript',
      'React.js',
      'Next.js',
      'Node.js',
      'Mobile Development',
      'Web Development',
      'Full Stack Development',
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Full Stack Developer',
      occupationLocation: {
        '@type': 'Country',
        name: 'Bangladesh',
      },
      skills: [
        'Flutter Development',
        'React Native Development',
        'Web Development',
        'Mobile App Development',
        'JavaScript Programming',
        'TypeScript Programming',
      ],
    },
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
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html tag}
</svelte:head>
