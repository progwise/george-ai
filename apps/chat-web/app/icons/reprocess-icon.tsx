import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const ReprocessIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('mx-auto flex size-4 items-center', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 2l4 4-4 4" />
        <path d="M3 11V10a5 5 0 0 1 5-5h13" />
        <path d="M7 22l-4-4 4-4" />
        <path d="M21 13v1a5 5 0 0 1-5 5H3" />
      </svg>
    </div>
  )
}
