import { Link, useMatch } from '@tanstack/react-router'
import { ReactNode, useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useAuth } from '../auth/auth'
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
  theme?: string
}

export default function TopNavigation({ user, theme }: TopNavigationProps) {
  const { t } = useTranslation()
  const { login, isReady } = useAuth()
  const [isAtTop, setIsAtTop] = useState(false)
  const handleScroll = useCallback((visible: boolean) => setIsAtTop(visible), [setIsAtTop])

  const conversationsRoutesMatch = useMatch({ from: '/_authenticated/conversations', shouldThrow: false })
  const isConversationPageDisplayed = !!conversationsRoutesMatch

  return (
    <>
      <header
        className={twMerge(
          'bg-base-100 fixed inset-x-0 top-0 z-50 transition-all',
          !isAtTop && !isConversationPageDisplayed && 'bg-base-100/80 shadow-md backdrop-blur-md',
        )}
      >
        <nav className="navbar px-body gap-2 text-sm lg:gap-4">
          {/* Logo and Brand-Name */}
          <Link to="/" className="flex grow items-center gap-2 text-nowrap text-xl font-bold">
            <BowlerLogoIcon className="size-10" />
            <h1>George-AI</h1>
          </Link>

          {/* Links to other pages */}
          <div className="flex items-center gap-1 max-lg:hidden">
            <TopNavigationLink to="/conversations">{t('topNavigation.conversations')}</TopNavigationLink>
            <TopNavigationLink to="/assistants">{t('topNavigation.assistants')}</TopNavigationLink>
            <TopNavigationLink to="/libraries">{t('topNavigation.libraries')}</TopNavigationLink>
          </div>

          <SettingsDropdown user={user} theme={theme} />

          {isReady && !user && (
            <div className="flex items-center justify-center gap-4">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => login()}>
                {t('actions.signIn')}
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* The navbar is position fixed, this div moves the page content below the navbar. */}
      <div className="h-16" />

      <ScrollObserver onScroll={handleScroll} />
    </>
  )
}
