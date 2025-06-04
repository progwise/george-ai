import React from 'react'
import { twMerge } from 'tailwind-merge'

type LanguageModelBadgeProps = React.PropsWithChildren<{
  size?: 'sm' | 'xs'
}>

export const LanguageModelBadge = ({ children, size = 'sm' }: LanguageModelBadgeProps) => {
  const badgeSizeClass: string = {
    sm: 'badge-sm',
    xs: 'badge-xs',
  }[size]

  return (
    <span className={twMerge('badge badge-neutral badge-outline badge-sm text-base-content', badgeSizeClass)}>
      {children}
    </span>
  )
}
