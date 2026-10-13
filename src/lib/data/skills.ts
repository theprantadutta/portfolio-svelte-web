/**
 * The skill groups on /skills, each drawn as a git branch.
 *
 * `daily` is the dark chip ("daily driver"); everything else is
 * "comfortable". `tags` lists the CMS project tags that count as using the
 * skill, so the hover tooltip ("18 projects") is computed from the projects
 * actually on the site instead of being typed in. A skill with no tags (or
 * a platform skill) simply shows its level.
 *
 * Group order and colours follow the design. The Web group is not in the
 * design: it holds the TypeScript frameworks from the CV that the four
 * design groups had no place for. Confirm (see TODO_CONTENT.md).
 */

export type SkillTone = 'blue' | 'purple' | 'cyan' | 'green' | 'orange'

export interface Skill {
  name: string
  daily: boolean
  tags?: string[]
  /** Count projects by platform instead of tags. */
  platform?: 'mobile'
}

export interface SkillGroup {
  name: string
  branch: string
  tone: SkillTone
  skills: Skill[]
}

export const skillGroups: SkillGroup[] = [
  {
    name: 'Mobile',
    branch: 'mobile',
    tone: 'blue',
    skills: [
      { name: 'Flutter', daily: true, tags: ['Flutter'] },
      { name: 'Dart', daily: true, tags: ['Dart', 'Flutter'] },
      { name: 'React Native', daily: true, tags: ['React Native'] },
      { name: 'Kotlin', daily: false, tags: ['Kotlin'] },
      { name: 'Android / iOS', daily: true, platform: 'mobile' },
      { name: 'Firebase', daily: false, tags: ['Firebase'] },
    ],
  },
  {
    name: 'Backend',
    branch: 'backend',
    tone: 'purple',
    skills: [
      {
        name: 'ASP.NET Core',
        daily: true,
        tags: ['ASP.NET Core', 'ASP.NET Core Web API', '.NET 10', 'C#'],
      },
      { name: 'Go', daily: true, tags: ['Go', 'Golang'] },
      { name: 'Node.js', daily: false, tags: ['Node.js'] },
      { name: 'SignalR', daily: false, tags: ['SignalR'] },
      { name: 'PostgreSQL', daily: true, tags: ['PostgreSQL'] },
      { name: 'SQL Server', daily: false, tags: ['SQL Server'] },
      { name: 'Redis', daily: false, tags: ['Redis'] },
    ],
  },
  {
    name: 'Web',
    branch: 'web',
    tone: 'cyan',
    skills: [
      { name: 'TypeScript', daily: true, tags: ['TypeScript', 'Next.js'] },
      { name: 'Angular', daily: false, tags: ['Angular'] },
      { name: 'Next.js', daily: false, tags: ['Next.js'] },
      { name: 'Svelte', daily: false, tags: ['Svelte'] },
      { name: 'React', daily: false, tags: ['React'] },
    ],
  },
  {
    name: 'Infra',
    branch: 'devops',
    tone: 'green',
    skills: [
      { name: 'Docker', daily: true },
      { name: 'Traefik', daily: false },
      { name: 'GitLab CI/CD', daily: true },
      { name: 'Hetzner VPS', daily: false },
      { name: 'Kubernetes', daily: false },
    ],
  },
  {
    name: 'AI',
    branch: 'ai',
    tone: 'orange',
    skills: [
      {
        name: 'LLM integrations',
        daily: true,
        tags: ['AI', 'LLM', 'LLM Gateway'],
      },
      { name: 'MCP servers', daily: true, tags: ['MCP'] },
      { name: 'OpenAI', daily: false },
      { name: 'Gemini', daily: false, tags: ['Gemini'] },
      { name: 'Claude', daily: false },
    ],
  },
]
