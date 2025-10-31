import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

const LibraryIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('size-4 stroke-2', className)}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
        <path d="M3 12A9 3 0 0 0 21 12"></path>
      </svg>
    </div>
  )
}

export default LibraryIcon
