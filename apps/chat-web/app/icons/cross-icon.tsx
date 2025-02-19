import { twMerge } from 'tailwind-merge'
import { IconProps } from './icon-props'

export const CrossIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('icon size-4', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="inline-block h-4 w-4 stroke-current"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </div>
  )
}
