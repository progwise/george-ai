import { twMerge } from 'tailwind-merge'

import { CurrentUserFragment } from '../gql/graphql'
import { SettingsDropdown } from './settings-dropdown'
import { WorkspaceSwitcher } from './workspace/workspace-switcher'

interface TopNavigationProps {
  user?: CurrentUserFragment | null
  isDrawerOpen: boolean
}

export default function TopNavigation({ user, isDrawerOpen = false }: TopNavigationProps) {
  return (
    <>
      <div className={twMerge('fixed inset-x-0 -top-0.5 z-50 transition-all duration-150 ease-in')}>
        <nav
          className={twMerge(
            'navbar z-50 w-full bg-transparent transition-all duration-150 ease-in',
            isDrawerOpen ? 'pl-64' : 'pl-14',
          )}
        >
          <div className="navbar-start flex pl-6"> {user && <WorkspaceSwitcher user={user} />}</div>
          <div className="navbar-end flex pr-4">
            <SettingsDropdown user={user} />
          </div>
        </nav>
      </div>
      {/* The navbar is position fixed, this div moves the page content below the navbar. */}
      <div className="h-16" />
    </>
  )
}
