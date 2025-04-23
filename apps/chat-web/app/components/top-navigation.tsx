import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useAuth } from '../auth/auth'
import { User } from '../gql/graphql'
import { useTranslation } from '../i18n/use-translation-hook'
import AcademicCapIcon from '../icons/academic-cap-icon'
import BowlerHatIcon from '../icons/bowler-hat-icon'
import BowlerLogoIcon from '../icons/bowler-logo-icon'
import { ConversationIcon } from '../icons/conversation-icon'
import { MenuIcon } from '../icons/menu-icon'
import MoonIcon from '../icons/moon-icon'
import SunIcon from '../icons/sun-icon'
import UserIcon from '../icons/user-icon'
import { FileRoutesByTo } from '../routeTree.gen'

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
  const { login, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<string>(initialTheme ?? DEFAULT_THEME)
  const menuRef = useRef<HTMLDivElement>(null)
  const drawerCheckboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.cookie = `${THEME_KEY}=${theme}; path=/; max-age=31536000`
  }, [theme])

  const handleThemeToggle = useCallback(() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')), [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    if (drawerCheckboxRef.current) drawerCheckboxRef.current.checked = false
  }, [])

  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu()
      }
    },
    [closeMenu],
  )

  useEffect(() => {
    if (isMenuOpen) document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [isMenuOpen, handleOutsideClick])

  const renderNavLinks = useCallback(
    (isMobile = false) => (
      <>
        <li>
          <Link to="/conversations/$" onClick={isMobile ? closeMenu : undefined} className="flex items-center gap-2">
            <ConversationIcon className="size-6" />
            {t('topNavigation.conversations')}
          </Link>
        </li>
        <li>
          <Link to="/assistants" onClick={isMobile ? closeMenu : undefined} className="flex items-center gap-2">
            <BowlerHatIcon className="size-6" />
            {t('topNavigation.assistants')}
          </Link>
        </li>
        <li>
          <Link to="/libraries" onClick={isMobile ? closeMenu : undefined} className="flex items-center gap-2">
            <AcademicCapIcon className="size-6" />
            {t('topNavigation.libraries')}
          </Link>
        </li>
      </>
    ),
    [t, closeMenu],
  )

  const renderAuthLinks = useCallback(
    (isMobile = false) =>
      user ? (
        <>
          {isMobile && (
            <li>
              <Link to="/profile" onClick={closeMenu}>
                {user.name}
              </Link>
            </li>
          )}
          <li>
            <button
              type="button"
              onClick={() => {
                logout()
                if (isMobile) closeMenu()
              }}
              className="flex items-center gap-2"
            >
              <UserIcon className="size-6" />
              {t('actions.signOut')}
            </button>
          </li>
        </>
      ) : (
        <>
          <li>
            <a
              href="https://calendly.com/michael-vogt-progwise/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent"
            >
              {t('topNavigation.demo')}
            </a>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                login()
                if (isMobile) closeMenu()
              }}
              className="flex items-center gap-2"
            >
              <UserIcon className="size-6" />
              {t('actions.signIn')}
            </button>
          </li>
        </>
      ),
    [user, t, login, logout, closeMenu],
  )

  return (
    <nav className="navbar sticky top-2 z-50 mb-6 rounded-box bg-base-200 shadow-xl lg:top-4 lg:mb-14">
      {/******************* Mobile ******************  */}
      <div className="flex w-full items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <Link to="/" className="btn btn-ghost" aria-label="Home">
            <BowlerLogoIcon className="size-8" />
          </Link>
        </div>
        {user ? (
          <Link to="/profile" className="btn btn-ghost gap-2">
            <span className="max-w-48 truncate">{user.name}</span>
          </Link>
        ) : (
          <button type="button" className="btn btn-ghost gap-2" onClick={login}>
            <UserIcon className="size-6" />
            {t('actions.signIn')}
          </button>
        )}

        <label className="swap swap-rotate" aria-label="Toggle theme">
          <input
            type="checkbox"
            className="theme-controller"
            value="dark" /* DaisyUI applies this theme when checked */
            checked={theme === 'dark'}
            onChange={handleThemeToggle}
          />
          <SunIcon className="swap-off size-6 fill-current" />
          <MoonIcon className="swap-on size-6 fill-current" />
        </label>

        <div className="dropdown dropdown-end" ref={menuRef}>
          <label tabIndex={0} className="btn btn-ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MenuIcon className="size-6" />
          </label>
          {isMenuOpen && (
            <ul
              tabIndex={0}
              className="menu-compact menu dropdown-content mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              {renderNavLinks(true)}
              {renderAuthLinks(true)}
            </ul>
          )}
        </div>
      </div>

      {/******************* Desktop ******************  */}
      <div className="hidden w-full items-center justify-between lg:flex">
        <div className="flex items-center gap-4">
          <Link to="/" className="btn btn-ghost" aria-label="Home">
            <BowlerLogoIcon className="size-8" />
            {t('brand')}
          </Link>
        </div>

        <div className="flex gap-4">
          <TopNavigationLink to="/conversations/$">
            <ConversationIcon className="size-6" />
            {t('topNavigation.conversations')}
          </TopNavigationLink>
          <TopNavigationLink to="/assistants">
            <BowlerHatIcon className="size-6" />
            {t('topNavigation.assistants')}
          </TopNavigationLink>
          <TopNavigationLink to="/libraries">
            <AcademicCapIcon className="size-6" />
            {t('topNavigation.libraries')}
          </TopNavigationLink>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <TopNavigationLink to="/profile">
                <span className="max-w-40 truncate">{user?.name || 'no name'}</span>
              </TopNavigationLink>
              <label className="swap swap-rotate" aria-label="Toggle theme">
                <input
                  type="checkbox"
                  className="theme-controller"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={handleThemeToggle}
                />
                <SunIcon className="swap-off size-6 fill-current" />
                <MoonIcon className="swap-on size-6 fill-current" />
              </label>

              <button type="button" className="btn btn-ghost gap-2" onClick={logout}>
                <UserIcon className="size-6" />
                {t('actions.signOut')}
              </button>
            </>
          ) : (
            <>
              <a
                href="https://calendly.com/michael-vogt-progwise/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent"
              >
                {t('topNavigation.demo')}
              </a>

              <label className="swap swap-rotate" aria-label="Toggle theme">
                <input
                  type="checkbox"
                  className="theme-controller"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={handleThemeToggle}
                />
                <SunIcon className="swap-off size-6 fill-current" />
                <MoonIcon className="swap-on size-6 fill-current" />
              </label>

              <button type="button" className="btn btn-ghost gap-2" onClick={login}>
                <UserIcon className="size-6" />
                {t('actions.signIn')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
