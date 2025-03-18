import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const ExclamationIcon = ({ className }: IconProps) => {
  return (
    <div className={twMerge('size-4', className)}>
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        aria-hidden="true"
        role="img"
        className="iconify iconify--emojione"
        preserveAspectRatio="xMidYMid meet"
        fill="#000000"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <g fill="#f50531">
            <path d="M37 42.4H27L23 2h18z"> </path>
            <ellipse cx="32" cy="54.4" rx="7.7" ry="7.6"></ellipse>
          </g>
        </g>
      </svg>
    </div>
  )
}
