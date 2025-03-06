import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const PlusIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('size-4', className)}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path d="M13 6V20" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 13H20" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}
