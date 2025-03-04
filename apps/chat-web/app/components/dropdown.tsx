import { JSX } from 'react'
import { twMerge } from 'tailwind-merge'

interface DropdownProps {
  title: string
  className?: string
  options: Array<{
    title: string
    action: () => void
    key?: string
  }>
}

export const Dropdown = ({
  title,
  options,
  className,
}: DropdownProps): JSX.Element => {
  const handleOptionClick = (action: () => void) => {
    action()
    // blur the active element to prevent the dropdown from staying open
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  return (
    <div className={twMerge('dropdown', className)}>
      <button type="button" className="btn no-animation w-full" tabIndex={0}>
        {title}
      </button>
      <ul
        tabIndex={0} // this is needed for safari, see https://bugs.webkit.org/show_bug.cgi?id=22261
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
      >
        {options.map((option) => {
          return (
            <li tabIndex={2} key={option.key ?? option.title}>
              <button
                type="button"
                className="text-left"
                onClick={() => handleOptionClick(option.action)}
              >
                {option.title}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
