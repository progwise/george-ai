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
  action: (item: DropDownItem) => void
}

export const Dropdown = ({ title, options, action, className }: DropdownProps): JSX.Element => {
  const handleOptionClick = (item: DropDownItem) => {
    action(item)
    // blur the active element to prevent the dropdown from staying open
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  return (
    <div className={twMerge('text-right', className)}>
      <Menu>
        <MenuButton className="input input-sm input-bordered flex w-full items-center justify-between gap-4 rounded-lg bg-white px-2 py-1 text-left text-sm focus:outline-none">
          {title}
          <ChevronUpDownIcon />
        </MenuButton>
        <MenuItems
          transition
          anchor="bottom end"
          className="border-back/4 flex flex-col items-start gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-black transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {options.map((item) => (
            <MenuItem key={item.id}>
              <button
                type="button"
                onClick={() => handleOptionClick(item)}
                className="btn btn-ghost btn-sm flex w-full justify-start font-normal"
              >
                {item.icon && <>{item.icon}</>}
                <span>{item.title}</span>
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  )
}
