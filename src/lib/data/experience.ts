export interface IExperience {
  /** Job title, e.g. "Software Developer" */
  role: string
  /** Employer, e.g. "KDS Group" */
  company: string
  /** Where the work was done, e.g. "Chattogram, Bangladesh" */
  place: string
  /** Display range, pre-formatted — these are not dates the site does maths on */
  date: string
  /** What the role involved */
  description: string
}

/**
 * Employment history, stored here rather than in Strapi.
 *
 * It used to be a Strapi collection, fetched at build time alongside projects
 * and skills. That was the wrong home for it. Every page on this site is
 * prerendered, so CMS content already needs a rebuild to appear — which means
 * the CMS was buying nothing an edit here does not, while costing a network
 * round trip on every build and a dependency that can fail one. Projects earn
 * their place in Strapi: dozens of fields, uploaded media, rich text, and they
 * change often. Three jobs' worth of plain text that changes once a year does
 * not.
 *
 * Same arrangement as `open-source.ts`, and typed rather than raw JSON so a
 * missing field fails `bun run check` instead of rendering as `undefined`.
 *
 * Order here is the order rendered: oldest first, so the timeline reads down
 * the page the way a log does. There is no sort key — the array is the sort.
 */
export const experiences: IExperience[] = [
  {
    role: 'Software Engineer, Intern',
    company: 'ZorgIT',
    place: 'Chattogram, Bangladesh',
    date: 'DEC’ 21 – FEB’ 22',
    description:
      'Completed an internship at ZorgIT, where I contributed to several projects using Next.js and React, collaborating closely with a highly experienced and dynamic team.',
  },
  {
    role: 'Front-end Engineer',
    company: 'Trigan',
    place: 'Dumfries, United Kingdom',
    date: 'FEB’ 22 – JUN’ 22',
    description:
      "At Trigan, I independently developed and maintained the company's official websites, overseeing the entire lifecycle from design to deployment, ensuring high performance and reliability.",
  },
  {
    // Both titles, one row. The promotion is to "Executive, Automation &
    // Systems"; "Software Developer" stays in front of it so a human reading
    // quickly and an ATS matching on keywords both still find it, and so the
    // single JUN' 22 – PRESENT range does not imply the new title was held for
    // the whole four years.
    role: 'Software Developer → Executive, Automation & Systems',
    company: 'KDS Group',
    place: 'Chattogram, Bangladesh',
    date: 'JUN’ 22 – PRESENT',
    description:
      'Built KDS Portal and Zakat apps with Flutter, improving HR and Zakat processes. Led KDS QMS and TLS app development with React Native and .NET Core. Designed an Ubuntu server with GitLab, Docker, and CI/CD for reliable company operations.',
  },
]
