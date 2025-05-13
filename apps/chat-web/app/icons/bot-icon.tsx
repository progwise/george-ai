import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

const BotIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('size-4 stroke-2', className)}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 8V4H8"></path>
        <rect width="16" height="12" x="4" y="8" rx="2"></rect>
        <path d="M2 14h2"></path>
        <path d="M20 14h2"></path>
        <path d="M15 13v2"></path>
        <path d="M9 13v2"></path>
      </svg>
    </div>
  )
}

export default BotIcon
