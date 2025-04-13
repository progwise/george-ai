import { Link } from '@tanstack/react-router'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useAuth } from '../auth/auth-hook'
import { useTranslation } from '../i18n/use-translation-hook'
import AcademicCapIcon from '../icons/academic-cap-icon'
import BowlerHatIcon from '../icons/bowler-hat-icon'
import BowlerLogoIcon from '../icons/bowler-logo-icon'
import { ConversationIcon } from '../icons/conversation-icon'
import { MenuIcon } from '../icons/menu-icon'
import UserIcon from '../icons/user-icon'
import { FileRoutesByTo } from '../routeTree.gen'

const THEME_KEY = 'theme'
const DEFAULT_THEME = 'light'

const getStoredTheme = () => {
  if (typeof window === 'undefined') return DEFAULT_THEME
  return localStorage.getItem(THEME_KEY) || DEFAULT_THEME
}

const setStoredTheme = (theme: string) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(THEME_KEY, theme)
  document.documentElement.setAttribute('data-theme', theme)
}

interface TopNavigationLinkProps {
  to: keyof FileRoutesByTo
  children: ReactNode
}

const TopNavigationLink = ({ to, children }: TopNavigationLinkProps) => (
  <Link to={to} className="btn btn-ghost" activeProps={{ className: 'btn-active' }} activeOptions={{ exact: false }}>
    {children}
  </Link>
)

export default function TopNavigation() {
  const { t } = useTranslation()
  const { user, login, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState(getStoredTheme())
  const menuRef = useRef<HTMLDivElement>(null)
  const drawerCheckboxRef = useRef<HTMLInputElement>(null)

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    setStoredTheme(newTheme)
  }, [theme])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    if (drawerCheckboxRef.current) {
      drawerCheckboxRef.current.checked = false
    }
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
    setStoredTheme(theme)
  }, [theme])

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('click', handleOutsideClick)
    }
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [isMenuOpen, handleOutsideClick])

  const renderNavLinks = useCallback(
    (isMobile = false) => (
      <>
        <li>
          <Link to="/conversations/$" onClick={isMobile ? closeMenu : undefined}>
            <ConversationIcon className="size-6" />
            {t('topNavigation.conversations')}
          </Link>
        </li>
        <li>
          <Link to="/assistants" onClick={isMobile ? closeMenu : undefined}>
            <BowlerHatIcon className="size-6" />
            {t('topNavigation.assistants')}
          </Link>
        </li>
        <li>
          <Link to="/libraries" onClick={isMobile ? closeMenu : undefined}>
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
            >
              <UserIcon className="size-6" />
              {t('topNavigation.signOut')}
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
            >
              <UserIcon className="size-6" />
              {t('topNavigation.signIn')}
            </button>
          </li>
        </>
      ),
    [user, t, login, logout, closeMenu],
  )

  return (
    <nav className="navbar sticky top-2 z-50 mb-6 rounded-box bg-base-200 shadow-xl lg:top-4 lg:mb-14">
      {/* Mobile Navigation */}
      <div className="flex w-full items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <label className="swap swap-rotate" aria-label="Toggle theme">
            <input
              type="checkbox"
              className="theme-controller"
              checked={theme === 'dark'}
              onChange={handleThemeToggle}
            />
            <svg className="swap-off h-10 w-10 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg className="swap-on h-10 w-10 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
          <Link to="/" className="btn btn-ghost" aria-label="Home">
            <BowlerLogoIcon className="size-8" />
          </Link>
        </div>

        {user ? (
          <Link to="/profile" className="btn btn-ghost gap-2">
            {user.name}
          </Link>
        ) : (
          <button type="button" className="btn btn-ghost gap-2" onClick={login}>
            <UserIcon className="size-6" />
            {t('topNavigation.signIn')}
          </button>
        )}

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

      {/* Desktop Navigation */}
      <div className="hidden w-full items-center justify-between lg:flex">
        <div className="flex items-center gap-4">
          <label className="swap swap-rotate" aria-label="Toggle theme">
            <input
              type="checkbox"
              className="theme-controller"
              checked={theme === 'dark'}
              onChange={handleThemeToggle}
            />
            <svg className="swap-off h-10 w-10 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg className="swap-on h-10 w-10 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
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
              <TopNavigationLink to="/profile">{user.name}</TopNavigationLink>
              <button type="button" className="btn btn-ghost gap-2" onClick={logout}>
                <UserIcon className="size-6" />
                {t('topNavigation.signOut')}
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
              <button type="button" className="btn btn-ghost gap-2" onClick={login}>
                <UserIcon className="size-6" />
                {t('topNavigation.signIn')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
