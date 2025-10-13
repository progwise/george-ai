import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const FilterIcon = ({ className }: IconProps) => {
  return (
    <svg
      className={twMerge('size-4', className)}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}
