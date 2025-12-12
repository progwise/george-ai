import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const ExclamationIcon = ({ className }: IconProps) => {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
      role="img"
      className={twMerge('size-4 fill-error', className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <path d="M37 42.4H27L23 2h18z" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"></path>
      <ellipse cx="32" cy="54.4" rx="7.7" ry="7.6"></ellipse>
    </svg>
  )
}
