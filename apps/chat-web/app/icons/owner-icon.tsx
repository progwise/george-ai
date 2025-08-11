import { twMerge } from 'tailwind-merge'

import type { IconProps } from './icon-props'

export const OwnerIcon = ({ className }: IconProps) => (
  <div className={twMerge('size-4', className)}>
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="black"
        d="M7.26.213a2.25 2.25 0 011.48 0l4.75 1.653A2.25 2.25 0 0115 3.991v4.01c0 2.048-1.181 3.747-2.45 4.991-1.282 1.255-2.757 2.15-3.573 2.598a2.024 2.024 0 01-1.954 0c-.816-.447-2.291-1.342-3.572-2.598C2.18 11.748 1 10.05 1 8V3.991c0-.957.606-1.81 1.51-2.125L7.26.213z"
      />
      <path
        fill="white"
        d="M11.28 5.47a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.47-3.47a.75.75 0 011.06 0z"
      />
    </svg>
  </div>
)
