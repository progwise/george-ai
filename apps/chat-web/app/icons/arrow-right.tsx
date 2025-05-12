import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const ArrowRight = ({ className }: IconProps) => {
  return (
    <div className={twMerge('size-4 stroke-2', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12h14"></path>
        <path d="m12 5 7 7-7 7"></path>
      </svg>
    </div>
  )
}
