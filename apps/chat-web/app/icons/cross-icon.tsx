import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const CrossIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('size-4', className)}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          stroke="currentColor"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </div>
  )
}
