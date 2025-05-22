import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const ChevronUpIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('flex size-4 shrink-0 items-center justify-center', className)}>
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M6 15L12 9L18 15" />
      </svg>
    </div>
  )
}
