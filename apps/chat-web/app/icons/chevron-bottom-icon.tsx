import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const ChevronBottomIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('flex size-4 shrink-0 items-center justify-center', className)}>
      <svg
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6 9L12 15L18 9" />
      </svg>
    </div>
  )
}
