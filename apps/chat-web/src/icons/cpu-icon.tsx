import type { IconProps } from './icon-props'

export const CpuIcon = ({ className }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 9h8m-8 3h8m-8 3h8M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7h2m14 0h2M3 12h2m14 0h2M3 17h2m14 0h2M7 3v2m5 0V3m5 0v2M7 19v2m5 0v2m5 0v2"
    />
  </svg>
)
