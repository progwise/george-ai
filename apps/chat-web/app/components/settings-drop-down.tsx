import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { JSX } from 'react'
import { twMerge } from 'tailwind-merge'

import { User } from '../gql/graphql'
import { Language } from '../i18n'

interface SettingsDropDownItem {
  id: string
  title: string
  icon?: JSX.Element
}

interface SettingsDropdownProps {
  title: string
  className?: string
  options: Array<SettingsDropDownItem>
  disabled?: boolean
  action?: (item: SettingsDropDownItem) => void
  user?: Pick<User, 'id' | 'name'>
  theme: string
  language: Language // ??
  // AuthContext?
}

export const SettingsDropdown = ({
  title,
  options,
  action,
  className,
  disabled,
}: SettingsDropdownProps): JSX.Element => {
  // initialize according to language and other settings (pass them as props?)

  //   const themeIcon =
  // const languageIcon =
  //   const profile = { title: '' }
  //   const themeSwitcher = { title: '', icon: <MoonIcon className="swap-on size-6 fill-current stroke-0" /> }
  //   const languageSwitcher = { title: '', icon: <GermanFlagIcon className="size-6" /> }
  //   const authStatus = { title: ''}

  const handleOptionClick = (item: SettingsDropDownItem) => {
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
          className="focus:outline-hidden input input-sm bg-base-100 flex w-full items-center justify-between gap-4 rounded-lg px-2 py-1 text-left text-sm"
          disabled={disabled}
        >
          {title}
        </MenuButton>
        <MenuItems
          transition
          anchor="bottom end"
          className="focus:outline-hidden border-base-content/25 bg-base-100 flex flex-col items-start gap-2 rounded-xl border px-3 py-2 text-sm transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {options.map((item) => (
            <MenuItem key={item.id}>
              <button
                type="button"
                onClick={() => handleOptionClick(item)}
                className="btn btn-ghost btn-sm flex w-full justify-start font-normal"
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
