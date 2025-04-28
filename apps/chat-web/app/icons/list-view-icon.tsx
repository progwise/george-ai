import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const ListViewIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('size-4', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={twMerge('h-4 w-4', className)}
      >
        <line x1={8} y1={6} x2={21} y2={6} />
        <line x1={8} y1={12} x2={21} y2={12} />
        <line x1={8} y1={18} x2={21} y2={18} />
        <line x1={3} y1={6} x2="3.01" y2={6} />
        <line x1={3} y1={12} x2="3.01" y2={12} />
        <line x1={3} y1={18} x2="3.01" y2={18} />
      </svg>
    </div>
  )
}
