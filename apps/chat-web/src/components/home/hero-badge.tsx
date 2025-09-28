import { JSX } from 'react'
import { twMerge } from 'tailwind-merge'

interface BadgeProps {
  icon: JSX.Element
  title: string
  text: string
  color: 'primary' | 'success'
  speed: 'fast' | 'slow'
  className?: string
}

export const HeroBadge = ({ icon, title, text, className, color, speed }: BadgeProps) => {
  const speedClassName: string = {
    fast: 'animate-duration-[4000ms]',
    slow: 'animate-duration-[5000ms]',
  }[speed]

  const iconClassName: string = {
    primary: 'bg-primary/20 text-primary',
    success: 'bg-success/20 text-success',
  }[color]

  return (
    <div
      className={twMerge(
        'bg-base-100 rounded-box border-base-300 flex items-center gap-2 border p-4 text-xs shadow-lg',
        'animate-infinite animate-ease-in-out animate-bounce',
        speedClassName,
        className,
      )}
    >
      <span className={twMerge('flex size-8 items-center justify-center rounded-full', iconClassName)}>{icon}</span>
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-base-content/50">{text}</span>
      </div>
    </div>
  )
}
