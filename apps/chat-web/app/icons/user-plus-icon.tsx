import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const UserPlusIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('size-4', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      >
        {/* User icon */}
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        {/* Plus icon */}
        <line x1="19" y1="8" x2="19" y2="14"></line>
        <line x1="22" y1="11" x2="16" y2="11"></line>
      </svg>
    </div>
  )
}
