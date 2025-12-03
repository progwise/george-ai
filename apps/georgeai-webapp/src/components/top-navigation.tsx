import { Link } from '@tanstack/react-router'
import { ReactNode, useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { UserFragment } from '../gql/graphql'
import { useTranslation } from '../i18n/use-translation-hook'
import { BowlerLogoIcon } from '../icons/bowler-logo-icon'
import { FileRoutesByTo } from '../routeTree.gen'
import { ScrollObserver } from './scroll-observer'
import { SettingsDropdown } from './settings-dropdown'
import { WorkspaceSwitcher } from './workspace/workspace-switcher'

interface TopNavigationLinkProps {
  to: keyof FileRoutesByTo
  children: ReactNode
}

const TopNavigationLink = ({ to, children }: TopNavigationLinkProps) => (
  <Link
    to={to}
    className="transition-colors"
    inactiveProps={{ className: 'hover:bg-base-300 text-base-content/50 hover:text-base-content hover:animate-pulse' }}
    activeProps={{ className: 'bg-base-content/70 text-base-100' }}
    activeOptions={{ exact: false }}
  >
    {children}
  </Link>
)

interface TopNavigationProps {
  user: UserFragment | null
  workspaceId: string | null
}

export default function TopNavigation({ user }: TopNavigationProps) {
  const { t } = useTranslation()
  const [isAtTop, setIsAtTop] = useState(false)
  const handleScroll = useCallback((visible: boolean) => setIsAtTop(visible), [setIsAtTop])

  return (
    <>
      <header
        className={twMerge(
          'fixed inset-x-0 top-0 z-50 transition-all',
          !isAtTop && 'bg-base-100/80 shadow-md backdrop-blur-md',
        )}
      >
        <nav className="navbar px-body gap-2 text-sm">
          {/* Logo and Brand-Name */}
          <div className="navbar-start flex grow text-nowrap">
            <Link
              to="/"
              className="transition-color flex items-center gap-2 text-nowrap rounded-md px-2 text-xl font-bold"
              activeProps={{ className: 'bg-base-content/80 text-base-100' }}
              inactiveProps={{
                className: 'hover:bg-base-300 text-base-content/50 hover:text-base-content hover:animate-pulse',
              }}
              activeOptions={{ exact: true }}
            >
              <BowlerLogoIcon className="hover:animate-wiggle size-10" />
              <span>George-AI</span>
            </Link>
          </div>

          <div className="navbar-center">
            <ul className="menu menu-horizontal menu-lg max-md:hidden">
              <li>
                <TopNavigationLink to="/conversations">{t('topNavigation.conversations')}</TopNavigationLink>
              </li>
              <li>
                <TopNavigationLink to="/assistants">{t('topNavigation.assistants')}</TopNavigationLink>
              </li>
              <li>
                <TopNavigationLink to="/lists">{t('topNavigation.lists')}</TopNavigationLink>
              </li>
              <li>
                <TopNavigationLink to="/libraries">{t('topNavigation.libraries')}</TopNavigationLink>
              </li>
            </ul>
          </div>
          <div className="navbar-end flex gap-2">
            {user && <WorkspaceSwitcher user={user} />}
            <SettingsDropdown user={user} />
          </div>
        </nav>
      </header>

      {/* The navbar is position fixed, this div moves the page content below the navbar. */}
      <div className="h-16" />

      <ScrollObserver onScroll={handleScroll} />
    </>
  )
}
