export type SkillCategory = 'frontend' | 'backend' | 'database' | 'cloud'

export interface ISkill {
  /** Display name */
  title: string
  category: SkillCategory
  /** 1–5 */
  rating: number
  favourite: boolean
}

/** The order the categorised views write the groups out in. */
export const skillCategoryOrder: SkillCategory[] = [
  'frontend',
  'backend',
  'database',
  'cloud',
]

/**
 * Skills, stored here rather than in Strapi.
 *
 * Every page on this site is prerendered, so CMS content already needs a
 * rebuild to appear — the CMS was buying nothing an edit here does not, while
 * costing a request on every build and a dependency that can fail one. Projects
 * stay in Strapi: dozens of fields, uploaded media, rich text, frequent change.
 * A list of nineteen names and ratings does not.
 *
 * Read out of the running Strapi instance rather than retyped, and **kept in
 * the order Strapi returned them** — the hexagon view renders this array
 * directly, so the order is visible on the page.
 *
 * `category` is stored rather than derived. Strapi held only title, rating and
 * isFavourite, so the cards view worked the grouping out by testing each title
 * against a list of substrings per category — which silently dropped anything
 * none of the lists mentioned. Storing it means an unassigned skill is a type
 * error instead of a row that quietly vanishes.
 *
 * The one edit to the data: Strapi has "Microservices" stored with a leading
 * space, which rendered inside the label. Trimmed here.
 */
export const skills: ISkill[] = [
  { title: 'ASP.Net Core', category: 'backend', rating: 4, favourite: true },
  { title: 'Cloud Computing', category: 'cloud', rating: 4, favourite: true },
  { title: 'Dart', category: 'frontend', rating: 5, favourite: true },
  { title: 'Docker', category: 'cloud', rating: 5, favourite: true },
  { title: 'Flutter', category: 'frontend', rating: 5, favourite: true },
  { title: 'Firebase', category: 'cloud', rating: 4, favourite: false },
  { title: 'Git', category: 'cloud', rating: 5, favourite: false },
  { title: 'Golang', category: 'backend', rating: 3, favourite: false },
  {
    title: 'Google Cloud Platform',
    category: 'cloud',
    rating: 3,
    favourite: false,
  },
  { title: 'Kotlin', category: 'frontend', rating: 3, favourite: false },
  { title: 'Kubernetes', category: 'cloud', rating: 3, favourite: false },
  { title: 'Microservices', category: 'backend', rating: 3, favourite: false },
  { title: 'Next.js', category: 'frontend', rating: 5, favourite: true },
  { title: 'PostgreSQL', category: 'database', rating: 5, favourite: true },
  { title: 'React', category: 'frontend', rating: 5, favourite: true },
  { title: 'React Native', category: 'frontend', rating: 5, favourite: true },
  { title: 'Redis', category: 'database', rating: 5, favourite: false },
  { title: 'Rust', category: 'backend', rating: 3, favourite: false },
  { title: 'SQL Server', category: 'database', rating: 4, favourite: false },
]
