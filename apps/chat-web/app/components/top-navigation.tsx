import { Link } from '@tanstack/react-router'
import { ReactNode, useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { UserFragment } from '../gql/graphql'
import { useTranslation } from '../i18n/use-translation-hook'
import BowlerLogoIcon from '../icons/bowler-logo-icon'
import { FileRoutesByTo } from '../routeTree.gen'
import { ScrollObserver } from './scroll-observer'
import { SettingsDropdown } from './settings-dropdown'

interface TopNavigationLinkProps {
  to: keyof FileRoutesByTo
  children: ReactNode
}

const TopNavigationLink = ({ to, children }: TopNavigationLinkProps) => (
  <Link to={to} className="btn btn-ghost" activeProps={{ className: 'btn-active' }} activeOptions={{ exact: false }}>
    {children}
  </Link>
)

interface TopNavigationProps {
  user?: UserFragment
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
        <nav className="navbar px-body gap-2 text-sm lg:gap-4">
          {/* Logo and Brand-Name */}
          <div className="flex grow text-nowrap">
            <Link to="/" className="flex items-center gap-2 text-nowrap text-xl font-bold">
              <BowlerLogoIcon className="size-10" />
              <h1>George-AI</h1>
            </Link>
          </div>

          {/* Links to other pages */}
          <div className="flex items-center gap-1 max-lg:hidden">
            <TopNavigationLink to="/conversations">{t('topNavigation.conversations')}</TopNavigationLink>
            <TopNavigationLink to="/lists">{t('topNavigation.lists')}</TopNavigationLink>
            <TopNavigationLink to="/assistants">{t('topNavigation.assistants')}</TopNavigationLink>
            <TopNavigationLink to="/libraries">{t('topNavigation.libraries')}</TopNavigationLink>
          </div>

          <SettingsDropdown user={user} />
        </nav>
      </header>

      {/* The navbar is position fixed, this div moves the page content below the navbar. */}
      <div className="h-16" />

      <ScrollObserver onScroll={handleScroll} />
    </>
  )
}
