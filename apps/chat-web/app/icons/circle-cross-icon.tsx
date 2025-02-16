import { twMerge } from 'tailwind-merge'
import { IconProps } from './icon-props'

export const CircleCrossIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('icon size-4', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        className="inline-block h-4 w-4 stroke-current"
      >
        <circle cx="13" cy="13" r="12" stroke="currentcolor" stroke-width="2" />
        <path
          d="M17.9497 8.05026L8.05024 17.9498"
          stroke="currentcolor"
          stroke-width="4"
          stroke-linecap="round"
        />
        <path
          d="M8.05026 8.05026L17.9498 17.9498"
          stroke="currentcolor"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
    </div>
  )
}
