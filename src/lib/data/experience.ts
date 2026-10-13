export interface IExperience {
  /** Job title, e.g. "Software Developer" */
  role: string
  /** Employer, e.g. "KDS Group" */
  company: string
  /** Where the work was done, e.g. "Chattogram, Bangladesh" */
  place: string
  /** First month, "YYYY-MM" */
  start: string
  /** Last month, "YYYY-MM", or omitted while ongoing */
  end?: string
  /**
   * The git branch the role is drawn on in the /skills timeline. The
   * full-time job line is `main`; anything that ran alongside it forks off.
   */
  branch: 'main' | 'contract'
  /** One line for the timeline */
  summary: string
  /** What the role involved, in full */
  description: string
  /** Optional bullet points, shown when the timeline entry is expanded */
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
 * The /skills timeline sorts by most recent activity, like
 * `git branch --sort=-committerdate`, so the order here does not matter.
 */
export const experiences: IExperience[] = [
  {
    role: 'Software Engineer, Intern',
    company: 'ZorgIT',
    place: 'Chattogram, Bangladesh',
    start: '2021-12',
    end: '2022-02',
    branch: 'main',
    summary: 'Next.js and React projects alongside a senior team.',
    description:
      'Completed an internship at ZorgIT, where I contributed to several projects using Next.js and React, collaborating closely with a highly experienced and dynamic team.',
  },
  {
    role: 'Front-end Engineer',
    company: 'Trigan',
    place: 'Dumfries, United Kingdom',
    start: '2022-02',
    end: '2022-06',
    branch: 'main',
    summary: "Trigan's websites end to end, from design to deployment.",
    description:
      "At Trigan, I independently developed and maintained the company's official websites, overseeing the entire lifecycle from design to deployment, ensuring high performance and reliability.",
  },
  {
    role: 'Software Developer',
    company: 'KDS Group',
    place: 'Chattogram, Bangladesh',
    start: '2022-06',
    branch: 'main',
    summary:
      '16+ production systems for 20,000+ people, AI gateway, 40 CI/CD pipelines.',
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
    start: '2025-12',
    end: '2026-03',
    branch: 'contract',
    summary:
      'U-Thrive, a US behavioral-health platform: 110+ commits, 14 merged PRs.',
    description:
      'Worked inside the product team on U-Thrive, a US behavioral-health platform connecting patients and clinicians, across its Flutter app, Node.js + MongoDB API on AWS, and React dashboard: 110+ commits and 14 merged pull requests.',
    highlights: [
      'Hardened security: moved Stream Chat token signing server-side, added a Dio auth interceptor with global 401 handling, and stripped token and PII logging.',
      'Shipped appointment reasons, insurance providers, batch survey submission, FCM push, video-call reliability fixes, and crisis-support entry points for the 988 Lifeline.',
    ],
  },
]

/**
 * The indie side branch on the /skills timeline. Its app counts are computed
 * from the CMS's store links; the start year and download figure come from
 * the design and the CV respectively, and the year is still to be confirmed
 * (TODO_CONTENT.md).
 */
export const indieDeveloper = {
  since: '2021',
  downloads: '11k+',
}
