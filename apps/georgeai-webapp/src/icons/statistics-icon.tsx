import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const StatisticsIcon = ({ className }: IconProps) => {
  return (
    <svg
      className={twMerge('size-4', className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Bar chart icon */}
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20V14" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  )
}
