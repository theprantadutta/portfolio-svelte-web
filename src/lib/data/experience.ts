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
  /** Optional bullet points, rendered under the description */
  highlights?: string[]
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
    // Both titles, one row. The promotion (17 Sep 2026) is to "Executive"; the
    // CV and LinkedIn render it "Executive, Software Engineering" so an ATS
    // matching on keywords still finds "Software", and this matches them.
    // "Software Developer" stays in front so the single JUN' 22 – PRESENT
    // range does not imply the new title was held for the whole four years.
    role: 'Software Developer → Executive, Software Engineering',
    company: 'KDS Group',
    place: 'Chattogram, Bangladesh',
    date: 'JUN’ 22 – PRESENT',
    description:
      "Primary developer of a garment manufacturer's internal software: 16+ production systems used across a 20,000+ person workforce, built and run end to end across mobile, web, APIs, IoT firmware, and infrastructure.",
    highlights: [
      'KDS Portal: Flutter HRM app for 20,000+ employees on Android, iOS, and a purpose-built desktop web UI, over a .NET 10 API bridging the legacy ERP. Improved HR processing speed by 40%.',
      'Project Argus: RFID verification of sealed export cartons on 40 Zebra handhelds, offline-first, with the server independently re-deriving every verdict.',
      'KDS Zakat: offline-first NFC-card distribution in Flutter with background sync and duplicate-read detection. Cut fraudulent distributions by 99.99%.',
      'KDS QMS and TLS: live quality and production tracking on the factory floor, from React Native tablets and a Svelte 5 wall dashboard down to ESP8266 firmware that lights a red, amber, or green signal on each sewing machine. Cut inspection delays by 80%.',
      'AI platform: KDS Lens, an OpenAI-compatible AI gateway with schema-constrained JSON extraction and model failover, and Kai, a Gemini + MCP assistant that answers questions across three factory systems.',
      'DevOps: moved production from Windows to dual Ubuntu servers, halving downtime, with 40 GitLab CI/CD pipelines and 17 self-hosted services.',
    ],
  },
  {
    // A remote contract that ran alongside KDS, so it starts later but is
    // listed after it: the array is ordered by start date.
    role: 'Flutter Developer (Contract, Remote)',
    company: 'Certorus',
    place: 'Remote',
    date: 'DEC’ 25 – MAR’ 26',
    description:
      'Worked inside the product team on U-Thrive, a US behavioral-health platform connecting patients and clinicians, across its Flutter app, Node.js + MongoDB API on AWS, and React dashboard: 110+ commits and 14 merged pull requests.',
    highlights: [
      'Hardened security: moved Stream Chat token signing server-side, added a Dio auth interceptor with global 401 handling, and stripped token and PII logging.',
      'Shipped appointment reasons, insurance providers, batch survey submission, FCM push, video-call reliability fixes, and crisis-support entry points for the 988 Lifeline.',
    ],
  },
]
