import type { Component } from 'svelte'

export interface TimelineItemData {
  date: string
  title: string
  location?: string
  description: string
  icon?: Component<{ class?: string }>
}
