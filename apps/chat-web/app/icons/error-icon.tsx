import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

const ErrorIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('size-4 shrink-0', className)}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          stroke="currentColor"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  )
}

export default ErrorIcon
