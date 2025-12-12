import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface DropdownContentProps {
  children: ReactNode
  className?: string
}

// Reusable dropdown content container with arrow/pointer styling.
// Used for dropdowns that need a speech bubble appearance with a top arrow.
export const DropdownContent = ({ children, className }: DropdownContentProps) => {
  return (
    <div
      className={twMerge(
        "relative z-20 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg before:absolute before:-top-2 before:right-4 before:-z-10 before:size-4 before:rotate-45 before:transform before:border-t before:border-l before:border-base-300 before:bg-base-100 before:content-[''] after:absolute after:top-0 after:right-2.5 after:z-10 after:h-1 after:w-7 after:bg-base-100 after:content-['']",
        className,
      )}
    >
      {children}
    </div>
  )
}
