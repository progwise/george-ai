import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { JSX } from 'react'
import { twMerge } from 'tailwind-merge'

import { ChevronUpDownIcon } from '../icons/chevron-up-down-icon'

interface DropDownItem {
  id: string
  title: string
  icon?: JSX.Element
}

interface DropdownProps {
  title: string
  className?: string
  options: Array<DropDownItem>
  disabled?: boolean
  action?: (item: DropDownItem) => void
}

export const Dropdown = ({ title, options, action, className, disabled }: DropdownProps): JSX.Element => {
  const handleOptionClick = (item: DropDownItem) => {
    if (!disabled && action) {
      action(item)
      // blur the active element to prevent the dropdown from staying open
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    }
  }

  return (
    <div className={twMerge('text-right', className)}>
      <Menu>
        <MenuButton
          className="input input-sm flex w-full items-center justify-between gap-4 rounded-lg bg-base-100 px-2 py-1 text-left text-sm focus:outline-hidden"
          disabled={disabled}
        >
          {title}
          <ChevronUpDownIcon className="text-base-content/60" />
        </MenuButton>
        <MenuItems
          transition
          anchor="bottom end"
          className="flex flex-col items-start gap-2 rounded-xl border border-base-content/25 bg-base-100 px-3 py-2 text-sm transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-hidden data-closed:scale-95 data-closed:opacity-0"
        >
          {options.map((item) => (
            <MenuItem key={item.id}>
              <button
                type="button"
                onClick={() => handleOptionClick(item)}
                className="btn flex w-full justify-start font-normal btn-ghost btn-sm"
                disabled={disabled}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.title}</span>
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  )
}
