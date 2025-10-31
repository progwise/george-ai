import type { IconProps } from './icon-props'

export const ServerIcon = ({ className }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12h14m-7-7v14m-7-7h14M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
    />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
    <circle cx="8" cy="16" r="1" fill="currentColor" />
    <circle cx="16" cy="8" r="1" fill="currentColor" />
    <circle cx="16" cy="16" r="1" fill="currentColor" />
  </svg>
)
