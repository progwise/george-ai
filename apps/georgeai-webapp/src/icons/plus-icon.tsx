import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const PlusIcon = ({ className }: IconProps) => {
  return (
    <svg
      className={twMerge('size-4', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}
