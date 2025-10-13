import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const EyeIcon = ({ className }: IconProps) => {
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
