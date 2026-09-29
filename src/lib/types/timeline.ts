import type { Component } from 'svelte'

export interface TimelineItemData {
  date: string
  title: string
  location?: string
  description: string
  /** Optional bullet points rendered under the description */
  highlights?: string[]
  icon?: Component<{ class?: string }>
}
