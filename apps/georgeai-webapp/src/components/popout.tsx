import { useId } from 'react'
import { twMerge } from 'tailwind-merge'

interface PopoutProps {
  buttonLabel?: string // Simple string label
  icon?: React.ReactNode // Leading icon
  buttonContent?: React.ReactNode // Full override if needed
  children?: React.ReactNode
  color?: 'info' | 'success' | 'warning' | 'error' | 'primary' | 'secondary' | 'neutral'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function Popout({ color = 'neutral', size = 'sm', ...props }: PopoutProps) {
  const id = useId()

  const colorMap = {
    info: 'text-info group-has-[:popover-open]:bg-info/20 group-has-[:popover-open]:text-info-content',
    success: 'text-success group-has-[:popover-open]:bg-success/20 group-has-[:popover-open]:text-success-content',
    warning: 'text-warning group-has-[:popover-open]:bg-warning/20 group-has-[:popover-open]:text-warning-content',
    error: 'text-error group-has-[:popover-open]:bg-error/20 group-has-[:popover-open]:text-error-content',
    primary: 'text-primary group-has-[:popover-open]:bg-primary/20 group-has-[:popover-open]:text-primary-content',
    secondary:
      'text-secondary group-has-[:popover-open]:bg-secondary/20 group-has-[:popover-open]:text-secondary-content',
    neutral: 'text-neutral group-has-[:popover-open]:bg-neutral group-has-[:popover-open]:text-neutral-content',
  }

  const sizeMap = {
    xs: { btn: 'btn-xs gap-1', icon: 'size-3' },
    sm: { btn: 'btn-sm gap-2', icon: 'size-4' },
    md: { btn: 'btn-md gap-2', icon: 'size-5' },
    lg: { btn: 'btn-lg gap-3', icon: 'size-6' },
  }

  const currentSize = sizeMap[size]

  return (
    <div className="group inline-block">
      <button
        type="button"
        className={twMerge(
          'btn btn-ghost transition-all flex flex-row items-center gap-2 select-none flex-nowrap',
          colorMap[color],
          currentSize.btn,
        )}
        popoverTarget={`popover-${id}`}
        style={{ anchorName: `--info-anchor-${id}` }}
      >
        {props.icon && <span className="shrink-0">{props.icon}</span>}
        <span className="truncate">{props.buttonContent || props.buttonLabel || 'Info'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={twMerge(
            'size-4 shrink-0 transition-transform duration-300 group-has-[:popover-open]:rotate-180',
            currentSize.icon,
          )}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        style={{
          positionAnchor: `--info-anchor-${id}`,
          //@ts-expect-error
          '--p-top': 'anchor(bottom)',
          '--p-left': 'anchor(left)',
        }}
        className="fixed bg-base-100 rounded-box z-1 shadow-xl p-4
               m-0 inset-auto 
               inset-x-4 bottom-4 max-w-xl w-auto
               sm:bottom-auto sm:inset-x-auto
               sm:top-(--p-top) sm:left-(--p-left)
               backdrop:bg-black/20 backdrop:transition-opacity"
        popover="auto"
        id={`popover-${id}`}
      >
        {props.children || (
          <div>
            <h3 className="font-bold text-lg">Popover Title</h3>
            <p className="text-sm">And here's some amazing content. It's very engaging. Right?</p>
          </div>
        )}
      </div>
    </div>
  )
}
