import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const GridViewIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('inline-flex items-center justify-center', className)}>
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
        <rect x={3} y={3} width={7} height={7} />
        <rect x={14} y={3} width={7} height={7} />
        <rect x={3} y={14} width={7} height={7} />
        <rect x={14} y={14} width={7} height={7} />
      </svg>
    </div>
  )
}
