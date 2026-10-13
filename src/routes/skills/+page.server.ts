import type { TimelineEntry } from '$components/skills/BranchTimeline.svelte'
import { experiences, indieDeveloper } from '$lib/data/experience'
import { allPullRequests } from '$lib/data/open-source'
import { skillGroups } from '$lib/data/skills'
import { tagNames } from '$lib/projects'
import { getGitHubSnapshot } from '$lib/server/github'
import { getAllProjects } from '$lib/server/strapi'
import type { PlatformType } from '$lib/types/types'
import type { PageServerLoad } from './$types'

const MOBILE: PlatformType[] = ['android', 'ios', 'android-and-ios']

/**
 * Like `git branch --sort=-committerdate`: whatever is still running comes
 * first, the day job ahead of side branches, then everything else by when it
 * last saw a commit.
 */
const byRecentActivity = (a: TimelineEntry, b: TimelineEntry) => {
  if (!a.end !== !b.end) return a.end ? 1 : -1
  if (!a.end && !b.end) {
    if ((a.branch === 'main') !== (b.branch === 'main')) {
      return a.branch === 'main' ? -1 : 1
    }
    return b.start.localeCompare(a.start)
  }
  return (b.end ?? '').localeCompare(a.end ?? '')
}

export const load: PageServerLoad = async ({ fetch }) => {
  const [projects, github] = await Promise.all([
    getAllProjects({ fetch }),
    getGitHubSnapshot(),
  ])

  const projectFacts = projects.data.map((project) => ({
    tags: new Set(tagNames(project).map((tag) => tag.toLowerCase())),
    mobile: MOBILE.includes(project.platformType),
  }))

  const groups = skillGroups.map((group) => ({
    ...group,
    skills: group.skills.map((skill) => {
      let count: number | null = null
      if (skill.platform === 'mobile') {
        count = projectFacts.filter((project) => project.mobile).length
      } else if (skill.tags?.length) {
        const wanted = skill.tags.map((tag) => tag.toLowerCase())
        count = projectFacts.filter((project) =>
          wanted.some((tag) => project.tags.has(tag))
        ).length
      }
      return { name: skill.name, daily: skill.daily, projects: count }
    }),
  }))

  const pullRequests = allPullRequests()
  const firstMerge = pullRequests
    .map((pr) => github.pullRequests[pr.url]?.mergedAt)
    .filter((date): date is string => Boolean(date))
    .sort()[0]

  const onPlay = projects.data.filter(
    (project) => project.googlePlayLink
  ).length
  const onAppStore = projects.data.filter(
    (project) => project.appStoreLink
  ).length

  const timeline: TimelineEntry[] = [
    ...experiences.map((job) => ({
      branch: job.branch,
      start: job.start,
      end: job.end ?? null,
      role: job.role,
      company: job.company,
      summary: job.summary,
      highlights: job.highlights ?? [],
    })),
    ...(firstMerge
      ? [
          {
            branch: 'oss' as const,
            start: firstMerge.slice(0, 7),
            end: null,
            role: 'Open-source contributor',
            company: null,
            summary: `${pullRequests.length} merged PRs: Flutter SDK, DevTools, Flutter packages, Supabase, Sentry, React Native docs.`,
            highlights: [],
          },
        ]
      : []),
    {
      branch: 'indie',
      start: indieDeveloper.since,
      end: null,
      role: 'Indie developer',
      company: null,
      summary: `${onPlay} apps on Google Play, ${onAppStore} on the App Store, ${indieDeveloper.downloads} downloads.`,
      highlights: [],
    },
  ]

  return {
    groups,
    timeline: timeline.sort(byRecentActivity),
  }
}
