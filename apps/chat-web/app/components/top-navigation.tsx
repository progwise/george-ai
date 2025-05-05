import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useAuth } from '../auth/auth'
import { User } from '../gql/graphql'
import { useTranslation } from '../i18n/use-translation-hook'
import MoonIcon from '../icons/moon-icon'
import SunIcon from '../icons/sun-icon'
import { FileRoutesByTo } from '../routeTree.gen'
import { ScrollObserver } from './scroll-observer'

const THEME_KEY = 'theme'
const DEFAULT_THEME = 'light'

export const getTheme = createServerFn({ method: 'GET' }).handler(() => getCookie(THEME_KEY))

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
  user?: Pick<User, 'id' | 'name'>
  theme?: string
}

export default function TopNavigation({ user, theme: initialTheme }: TopNavigationProps) {
  const { t } = useTranslation()
  const { login, logout, isReady } = useAuth()
  const [theme, setTheme] = useState<string>(initialTheme ?? DEFAULT_THEME)
  const [isAtTop, setIsAtTop] = useState(false)
  const handleScroll = useCallback((visible: boolean) => setIsAtTop(visible), [setIsAtTop])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.cookie = `${THEME_KEY}=${theme}; path=/; max-age=31536000`
  }, [theme])

  const handleThemeToggle = useCallback(() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')), [])

  return (
    <>
      <header
        className={twMerge(
          'bg-base-100 text-base-content fixed inset-x-0 top-0 z-50 transition-all',
          !isAtTop && 'bg-base-100/80 shadow-md backdrop-blur-md',
        )}
      >
        <nav className="navbar container gap-2 text-sm lg:gap-4">
          {/* Logo and Brand-Name */}
          <Link to="/" className="flex grow items-center gap-2 text-nowrap text-xl font-bold">
            <span className="bg-neutral text-neutral-content flex size-10 items-center justify-center rounded-full">
              G
            </span>
            <h1>George-AI</h1>
          </Link>

          {/* Links to other pages */}
          <div className="flex items-center gap-1 max-lg:hidden">
            <TopNavigationLink to="/conversations/$">{t('topNavigation.conversations')}</TopNavigationLink>
            <TopNavigationLink to="/assistants">{t('topNavigation.assistants')}</TopNavigationLink>
            <TopNavigationLink to="/libraries">{t('topNavigation.libraries')}</TopNavigationLink>
          </div>

          {/* Theme-Switcher */}
          <label className="swap swap-rotate btn btn-ghost" aria-label="Toggle theme">
            <input
              type="checkbox"
              className="theme-controller"
              value="dark" /* DaisyUI applies this theme when checked */
              checked={theme === 'dark'}
              onChange={handleThemeToggle}
            />
            <SunIcon className="swap-off size-6 fill-current stroke-0" />
            <MoonIcon className="swap-on size-6 fill-current stroke-0" />
          </label>

          {/* Authenctation Links */}
          <div className="flex items-center justify-center gap-4">
            {user && (
              <Link to="/profile" className="contents">
                <span className="max-w-48 truncate max-lg:hidden">{user.name}</span>
                <div className="avatar avatar-placeholder bg-base-300 text-base-content btn btn-ghost size-10 rounded-full">
                  <span className="text-base">{user.name?.at(0)?.toUpperCase()}</span>
                </div>
              </Link>
            )}

            {isReady && user && (
              <button type="button" className="btn btn-outline btn-sm max-lg:hidden" onClick={logout}>
                {t('actions.signOut')}
              </button>
            )}

            {isReady && !user && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => login()}>
                {t('actions.signIn')}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* The navbar is position fixed, this div moves the page content below the navbar. */}
      <div className="h-16" />

      <ScrollObserver onScroll={handleScroll} />
    </>
  )
}
