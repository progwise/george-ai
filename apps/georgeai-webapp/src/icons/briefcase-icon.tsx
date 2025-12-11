import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const BriefcaseIcon = ({ className }: IconProps) => {
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
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      <path d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z" />
    </svg>
  )
}
