// import { useCallback, useState } from 'react'
import { useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { UserFragment } from '../gql/graphql'
import { ScrollObserver } from './scroll-observer'
import { SettingsDropdown } from './settings-dropdown'
import { WorkspaceSwitcher } from './workspace/workspace-switcher'

interface TopNavigationProps {
  user: UserFragment | null
  workspaceId: string | null
  isDrawerOpen: boolean
}

export default function TopNavigation({ user, isDrawerOpen = false }: TopNavigationProps) {
  const [isAtTop, setIsAtTop] = useState(false)
  const handleScroll = useCallback((visible: boolean) => setIsAtTop(visible), [setIsAtTop])

  return (
    // TODO: change de.ts and en.ts
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

      <ScrollObserver onScroll={handleScroll} />
    </>
  )
}
