import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const DropIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('mx-auto flex size-4 items-center', className)}>
      <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 0 1 1 1v12.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-5 5a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 1.414-1.414L9 15.586V3a1 1 0 0 1 1-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}
