import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

const SystemIcon = ({ className }: IconProps) => (
  <div className={twMerge('size-4', className)}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 19h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
)

export default SystemIcon
