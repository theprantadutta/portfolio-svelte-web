import type { Component } from 'svelte'

import type {
  ProjectDataAttributes,
  PlatformType,
  FeatureFlag,
} from '$lib/types/types'
import FaBolt from '$icons/FaBolt.svelte'
import FaCode from '$icons/FaCode.svelte'
import FaGlobe from '$icons/FaGlobe.svelte'
import FaHeart from '$icons/FaHeart.svelte'
import FaLightbulb from '$icons/FaLightbulb.svelte'
import FaLock from '$icons/FaLock.svelte'
import FaMobile from '$icons/FaMobile.svelte'
import FaPalette from '$icons/FaPalette.svelte'
import FaRocket from '$icons/FaRocket.svelte'
import FaTools from '$icons/FaTools.svelte'

// Feature flag to full feature data mapping.
//
// In React the `icon` was a prebuilt element (React.createElement(FaBolt,
// {className})). Svelte components are not values you can pre-render outside a
// template, so the icon is stored as the component itself and the consumer
// renders it with <feature.icon class="h-6 w-6" />. Same output.
export interface FeatureData {
  icon: Component<{ class?: string }>
  title: string
  description: string
  category:
    | 'design'
    | 'performance'
    | 'security'
    | 'compatibility'
    | 'deployment'
    | 'documentation'
    | 'development'
}

export const FEATURE_FLAG_MAP: Record<FeatureFlag, FeatureData> = {
  performant: {
    icon: FaBolt,
    title: 'High Performance',
    description:
      'Fast loading times and smooth animations for an excellent user experience.',
    category: 'performance',
  },
  'mobile-first': {
    icon: FaMobile,
    title: 'Mobile-First Design',
    description:
      'Optimized for mobile devices with intuitive touch interactions and responsive layouts.',
    category: 'design',
  },
  'cross-platform': {
    icon: FaGlobe,
    title: 'Cross-Platform',
    description: 'Works seamlessly across different browsers and devices.',
    category: 'compatibility',
  },
  'open-source': {
    icon: FaCode,
    title: 'Open Source',
    description: 'Source code is available for learning and contribution.',
    category: 'development',
  },
  'production-ready': {
    icon: FaRocket,
    title: 'Production Ready',
    description: 'Deployed and available in app stores for real users.',
    category: 'deployment',
  },
  'well-documented': {
    icon: FaLightbulb,
    title: 'Well Documented',
    description: 'Comprehensive documentation and detailed project insights.',
    category: 'documentation',
  },
  secure: {
    icon: FaLock,
    title: 'Reliable & Secure',
    description:
      'Built with security best practices and reliable architecture.',
    category: 'security',
  },
  'modern-ui': {
    icon: FaPalette,
    title: 'Modern UI/UX',
    description:
      'Contemporary user interface with attention to design details.',
    category: 'design',
  },
  'user-centered': {
    icon: FaHeart,
    title: 'User-Centered',
    description: 'Designed with user experience and accessibility in mind.',
    category: 'design',
  },
  'modern-dev': {
    icon: FaTools,
    title: 'Modern Development',
    description: 'Leverages latest development tools and methodologies.',
    category: 'development',
  },
}

export interface ProjectAnalysis {
  platformType: PlatformType
  technologyStack: {
    frontend: string[]
    backend: string[]
    mobile: string[]
    tools: string[]
  }
  availabilityMetrics: {
    hasLiveDemo: boolean
    hasSourceCode: boolean
    hasAppStore: boolean
    accessibilityScore: number
  }
  contentQuality: {
    hasDetailedDescription: boolean
    visualAssetCount: number
    technologyDiversity: number
    completenessScore: number
  }
  featuredProject: boolean
  projectInsights: {
    completeness: number
    platformReach: number
    technicalComplexity: number
    visualRichness: number
  }
}

export const analyzeProject = (
  project: ProjectDataAttributes
): ProjectAnalysis => {
  const platformType = project.platformType
  const technologyStack = categorizeTags(project.Tags || [])
  const availabilityMetrics = calculateAvailability(project)
  const contentQuality = assessContentRichness(project)
  const featuredProject = project.isFeatured
  const projectInsights = generateProjectInsights(project)

  return {
    platformType,
    technologyStack,
    availabilityMetrics,
    contentQuality,
    featuredProject,
    projectInsights,
  }
}

const categorizeTags = (
  tags: { id: number; name: string }[]
): ProjectAnalysis['technologyStack'] => {
  const frontend: string[] = []
  const backend: string[] = []
  const mobile: string[] = []
  const tools: string[] = []

  tags.forEach((tag) => {
    const name = tag.name.toLowerCase()

    if (
      [
        'react',
        'vue',
        'angular',
        'next.js',
        'nuxt',
        'html',
        'css',
        'javascript',
        'typescript',
      ].includes(name)
    ) {
      frontend.push(tag.name)
    } else if (
      [
        'node.js',
        'express',
        'nestjs',
        'django',
        'flask',
        'spring',
        'laravel',
      ].includes(name)
    ) {
      backend.push(tag.name)
    } else if (
      ['flutter', 'react native', 'android', 'ios', 'kotlin', 'swift'].includes(
        name
      )
    ) {
      mobile.push(tag.name)
    } else {
      tools.push(tag.name)
    }
  })

  return { frontend, backend, mobile, tools }
}

const calculateAvailability = (
  project: ProjectDataAttributes
): ProjectAnalysis['availabilityMetrics'] => {
  const hasLiveDemo = !!project.googlePlayLink || !!project.appStoreLink
  const hasSourceCode = !!project.githubLink
  const hasAppStore = !!project.appStoreLink

  let accessibilityScore = 0
  if (hasLiveDemo) accessibilityScore += 40
  if (hasSourceCode) accessibilityScore += 40
  if (project.imageUrls?.length > 0) accessibilityScore += 20

  return {
    hasLiveDemo,
    hasSourceCode,
    hasAppStore,
    accessibilityScore,
  }
}

const assessContentRichness = (
  project: ProjectDataAttributes
): ProjectAnalysis['contentQuality'] => {
  const hasDetailedDescription = !!(
    project.longDescription && project.longDescription.length > 0
  )
  const visualAssetCount = project.imageUrls?.length || 0
  const technologyDiversity = project.Tags?.length || 0

  let completenessScore = 0
  if (project.title) completenessScore += 10
  if (project.description) completenessScore += 15
  if (hasDetailedDescription) completenessScore += 25
  if (visualAssetCount > 0) completenessScore += 20
  if (technologyDiversity > 0) completenessScore += 15
  if (project.githubLink) completenessScore += 10
  if (project.googlePlayLink) completenessScore += 5
  if (project.appStoreLink) completenessScore += 5

  return {
    hasDetailedDescription,
    visualAssetCount,
    technologyDiversity,
    completenessScore,
  }
}

const generateProjectInsights = (
  project: ProjectDataAttributes
): ProjectAnalysis['projectInsights'] => {
  // Completeness based on project status.
  //
  // NOTE: 'ongoing' was `90 + Math.floor(Math.random() * 6)` under Next, which
  // re-rolled on every ISR revalidation. These pages are prerendered once per
  // build, so the value is stable per deploy either way; the derivation is kept
  // as-is so the rendered range matches the old site.
  let completeness: number
  switch (project.projectStatus) {
    case 'completed':
      completeness = 100
      break
    case 'ongoing':
      completeness = 90 + Math.floor(Math.random() * 6)
      break
    case 'planned':
      completeness = 50
      break
    default:
      completeness = 0
  }

  let platformReach = 1
  if (project.googlePlayLink) platformReach += 1
  if (project.appStoreLink) platformReach += 1
  if (project.githubLink) platformReach += 1

  // Real complexity from Strapi (1-5 scale, doubled for a 1-10 display).
  const technicalComplexity = project.complexity * 2
  const visualRichness = project.imageUrls?.length || 0

  return {
    completeness,
    platformReach,
    technicalComplexity,
    visualRichness,
  }
}

export const getPlatformBadgeInfo = (platformType: PlatformType) => {
  const badges: Record<
    PlatformType,
    { label: string; color: string; textColor: string }
  > = {
    android: {
      label: 'Android App',
      color: 'from-green-500/20 to-emerald-500/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    ios: {
      label: 'iOS App',
      color: 'from-gray-500/20 to-slate-500/20',
      textColor: 'text-gray-600 dark:text-gray-400',
    },
    'android-and-ios': {
      label: 'Mobile App',
      color: 'from-primary-500/20 to-secondary-500/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    web: {
      label: 'Web Application',
      color: 'from-primary-500/20 to-secondary-500/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    cloud: {
      label: 'Cloud Service',
      color: 'from-orange-500/20 to-amber-500/20',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
  }

  return badges[platformType]
}

export const getStatusBadgeInfo = (
  status: ProjectDataAttributes['projectStatus']
) => {
  const badges: Record<
    ProjectDataAttributes['projectStatus'],
    { label: string; color: string; textColor: string }
  > = {
    planned: {
      label: 'Planned',
      color: 'from-yellow-500/20 to-amber-500/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    ongoing: {
      label: 'In Progress',
      color: 'from-primary-500/20 to-primary-500/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    completed: {
      label: 'Completed',
      color: 'from-green-500/20 to-emerald-500/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
  }

  return badges[status]
}

export const getDeveloperRoleInfo = (
  role: ProjectDataAttributes['developerRole']
) => {
  const roles: Record<ProjectDataAttributes['developerRole'], string> = {
    solo: 'Solo Developer',
    'small-team': 'Small Team',
    'cross-functional': 'Cross-functional Team',
    'feature-ownership': 'Feature Owner',
    freelance: 'Freelance Project',
    'open-source': 'Open Source Contributor',
  }

  return roles[role]
}

export const getOptimalImageSrc = (
  image: any,
  context: 'hero' | 'gallery' | 'thumbnail' = 'gallery'
) => {
  if (!image?.formats) return ''

  switch (context) {
    case 'hero':
      return image.formats.large?.url || image.formats.medium?.url || ''
    case 'gallery':
      return image.formats.medium?.url || image.formats.large?.url || ''
    case 'thumbnail':
      return image.formats.thumbnail?.url || image.formats.small?.url || ''
    default:
      return image.formats.medium?.url || ''
  }
}

export const getProjectFeatures = (
  featureFlags: { id: number; flag: FeatureFlag }[]
): FeatureData[] => {
  return featureFlags.map((f) => FEATURE_FLAG_MAP[f.flag]).filter(Boolean)
}
