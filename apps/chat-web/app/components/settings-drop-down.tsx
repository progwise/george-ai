import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { JSX, useCallback, useEffect, useRef, useState } from 'react'
import { getCookie } from 'vinxi/http'

import { useAuth } from '../auth/auth'
import { User } from '../gql/graphql'
import { useLanguage } from '../i18n/language-provider'
import { useTranslation } from '../i18n/use-translation-hook'
import { MenuEllipsisIcon } from '../icons/menu-ellipsis-icon'
import MoonIcon from '../icons/moon-icon'
import SunIcon from '../icons/sun-icon'

const THEME_KEY = 'theme'
const DEFAULT_THEME = 'light'

export const getTheme = createServerFn({ method: 'GET' }).handler(() => getCookie(THEME_KEY))

interface SettingsDropdownProps {
  user?: Pick<User, 'id' | 'name'>
  theme?: string
}

export const SettingsDropdown = ({ user, theme: initialTheme }: SettingsDropdownProps): JSX.Element => {
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()
  const { logout, isReady } = useAuth()
  const [theme, setTheme] = useState<string>(initialTheme ?? DEFAULT_THEME)
  const dropdownRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.cookie = `${THEME_KEY}=${theme}; path=/; max-age=31536000`
  }, [theme])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        dropdownRef.current.removeAttribute('open')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    dropdownRef.current?.removeAttribute('open')
  }, [])

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'de' : 'en')
    dropdownRef.current?.removeAttribute('open')
  }

  const themeText = theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')
  const languageText = language === 'en' ? 'German' : 'Englisch'

  return (
    <details className="dropdown dropdown-end" ref={dropdownRef}>
      <summary className="btn btn-ghost btn-circle list-none">
        {!user && <MenuEllipsisIcon className="size-6" />}

        {user && (
          <>
            <div className="avatar avatar-placeholder bg-base-300 text-base-content btn btn-ghost size-10 rounded-full">
              <span className="btn btn-circle btn-md text-base">{user.name?.at(0)?.toUpperCase()}</span>
            </div>
          </>
        )}
      </summary>

      <ul className="dropdown-content menu rounded-box bg-base-200 min-w-55 mt-2 shadow-sm">
        {/* Link to profile */}
        {user && (
          <li className="border-b-2 border-b-neutral-300">
            <Link to="/profile" onClick={() => dropdownRef.current?.removeAttribute('open')}>
              <span className="max-w-48 truncate max-lg:hidden">{user.name}</span>
            </Link>
          </li>
        )}

        {/* Theme-Switcher */}
        <li>
          <label className="grid-cols-[1fr_min-content]">
            {themeText}
            <div className="swap swap-rotate">
              <input
                type="checkbox"
                className="theme-controller"
                value="dark" /* DaisyUI applies this theme when checked */
                checked={theme === 'dark'}
                onChange={handleThemeToggle}
              />
              <SunIcon className="swap-on size-4 fill-current stroke-0" />
              <MoonIcon className="swap-off size-4 fill-current stroke-0" />
            </div>
          </label>
        </li>

        {/* Language-Switcher */}
        <li>
          <label className="grid-cols-[1fr_min-content]">
            {languageText}
            <div className="swap swap-rotate">
              <button
                type="button"
                onClick={handleLanguageToggle}
                className="btn btn-circle btn-ghost btn-sm flex size-4 items-center"
              >
                {language === 'en' ? 'DE' : 'EN'}
              </button>
            </div>
          </label>
        </li>

        {/* Sign-Out */}
        {isReady && user && (
          <li>
            <button type="button" onClick={logout}>
              {t('actions.signOut')}
            </button>
          </li>
        )}
      </ul>
    </details>
  )
}
