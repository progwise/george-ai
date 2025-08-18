import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

export const ListPlusIcon = ({ className }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={twMerge('size-6', className)}
    >
      {/* List lines */}
      <line x1={3} y1={6} x2={13} y2={6} />
      <line x1={3} y1={12} x2={13} y2={12} />
      <line x1={3} y1={18} x2={11} y2={18} />

      {/* Plus sign in medium circle */}
      <circle cx={17.5} cy={17.5} r={4.5} strokeWidth={1.5} />
      <line x1={17.5} y1={15} x2={17.5} y2={20} strokeWidth={1.5} />
      <line x1={15} y1={17.5} x2={20} y2={17.5} strokeWidth={1.5} />
    </svg>
  )
}
