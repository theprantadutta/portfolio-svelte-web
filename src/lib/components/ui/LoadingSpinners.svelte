<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    color?: 'primary' | 'white' | 'gray' | 'accent'
    class?: string
    outerCircleColor?: string
    innerCircleColor?: string
    barColor?: string
  }

  let {
    size = 'md',
    color = 'white',
    class: className = '',
    outerCircleColor,
    innerCircleColor,
    barColor,
  }: Props = $props()

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600',
    accent: 'text-secondary-600',
  }

  const finalColor = $derived(outerCircleColor || colorClasses[color])
</script>

<div class="{sizeClasses[size]} {className} relative">
  <!-- Outer rotating circle -->
  <div
    class="h-full w-full border-4 border-transparent border-t-current {finalColor} animate-spin rounded-full"
  ></div>

  <!-- Inner pulsing circle -->
  <div
    class="absolute inset-2 border-2 border-current {innerCircleColor ||
      finalColor} animate-pulse rounded-full opacity-60"
  ></div>

  <!-- Center bars -->
  <div class="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 transform">
    <div class="flex items-end space-x-0.5">
      {#each [0, 1, 2] as index (index)}
        <div
          class="h-2 w-0.5 bg-current {barColor ||
            finalColor} animate-bounce rounded-sm"
          style="animation-delay: {index * 0.1}s; animation-duration: 1s"
        ></div>
      {/each}
    </div>
  </div>
</div>
