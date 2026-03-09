import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const HamburgerMenuIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('size-4', className)}>
      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </div>
  )
}
