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
        "bg-base-100 rounded-box border-base-300 before:bg-base-100 before:border-base-300 after:bg-base-100 relative z-20 border p-2 shadow-lg before:absolute before:-top-2 before:right-4 before:-z-10 before:h-4 before:w-4 before:rotate-45 before:transform before:border-l before:border-t before:content-[''] after:absolute after:right-2.5 after:top-0 after:z-10 after:h-1 after:w-7 after:content-['']",
        className,
      )}
    >
      {children}
    </div>
  )
}
