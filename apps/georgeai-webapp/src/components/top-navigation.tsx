import { twMerge } from 'tailwind-merge'

import { CurrentUserFragment } from '../gql/graphql'
import { HamburgerMenuIcon } from '../icons/hamburger-menu-icon'
import { SettingsDropdown } from './settings-dropdown'
import { WorkspaceSwitcher } from './workspace/workspace-switcher'

interface TopNavigationProps {
  user?: CurrentUserFragment | null
  isDrawerOpen: boolean
  setIsDrawerOpen: (value: boolean) => void
}

export default function TopNavigation({ user, isDrawerOpen, setIsDrawerOpen }: TopNavigationProps) {
  return (
    <>
      <div className={twMerge('fixed inset-x-0 -top-0.5 z-50 transition-all duration-150 ease-in')}>
        <nav
          className={twMerge(
            'navbar z-50 w-full bg-transparent transition-all duration-150 ease-in',
            isDrawerOpen ? 'md:pl-64' : 'md:pl-14',
          )}
        >
          <div className="navbar-start flex pl-1 md:pl-4">
            <button
              type="button"
              className="btn btn-circle pr-1 pb-1 btn-ghost md:hidden"
              onClick={() => setIsDrawerOpen(true)}
            >
              <HamburgerMenuIcon />
            </button>
            {user && <WorkspaceSwitcher user={user} />}
          </div>
          <div className="navbar-end flex md:pr-4">
            <SettingsDropdown user={user} />
          </div>
        </nav>
      </div>
      {/* The navbar is position fixed, this div moves the page content below the navbar. */}
      <div className="h-16" />
    </>
  )
}
