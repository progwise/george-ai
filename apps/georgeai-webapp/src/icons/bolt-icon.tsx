import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const BoltIcon = ({ className }: IconProps) => {
  return (
    <svg
      className={twMerge('mx-auto size-4', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
      />
    </svg>
  )
}
