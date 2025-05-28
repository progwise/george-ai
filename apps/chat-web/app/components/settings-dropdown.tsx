import { Link } from '@tanstack/react-router'
import { JSX } from 'react'

import { useAuth } from '../auth/auth'
import { User } from '../gql/graphql'
import { useTheme } from '../hooks/use-theme'
import { useLanguage } from '../i18n/use-language-hook'
import { useTranslation } from '../i18n/use-translation-hook'
import { ExitIcon } from '../icons/exit-icon'
import { MenuEllipsisIcon } from '../icons/menu-ellipsis-icon'
import MoonIcon from '../icons/moon-icon'
import SunIcon from '../icons/sun-icon'
import SystemIcon from '../icons/system-icon'

interface SettingsDropdownProps {
  user?: Pick<User, 'id' | 'name'>
}

export const SettingsDropdown = ({ user }: SettingsDropdownProps): JSX.Element => {
  const { t } = useTranslation()
  const { logout, isReady } = useAuth()
  const { language, setLanguage } = useLanguage()
  const [theme, setTheme] = useTheme()

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'de' : 'en')
  }

  const themeText = theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')
  const languageText = language === 'en' ? 'Language: German' : 'Sprache: Englisch'

  return (
    <div className="dropdown dropdown-end">
      {/* menu button */}
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle list-none">
        {user ? (
          <div className="avatar avatar-placeholder bg-base-300 text-base-content btn btn-ghost size-10 rounded-full">
            <span className="btn btn-circle btn-md text-base">{user.name?.at(0)?.toUpperCase()}</span>
          </div>
        ) : (
          <MenuEllipsisIcon className="size-6" />
        )}
      </div>

      <ul tabIndex={0} className="dropdown-content menu rounded-box bg-base-200 min-w-55 mt-2 shadow-sm">
        {/* Link to profile */}
        {user && (
          <>
            <li>
              <Link
                to="/profile"
                onClick={() => {
                  {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur()
                    }
                  }
                }}
              >
                <span className="truncate">{user.name}</span>
              </Link>
            </li>
            <div className="divider m-0" />
          </>
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
              <SunIcon className="swap-on" />
              <MoonIcon className="swap-off" />
            </div>
          </label>
        </li>

        {/* Language-Switcher */}
        <li>
          <button onClick={handleLanguageToggle} type="button" className="grid-cols-[1fr_min-content]">
            {languageText}
            <span>{language === 'en' ? 'DE' : 'EN'}</span>
          </button>
        </li>

        {/* Sign-Out */}
        {isReady && user && (
          <>
            <div className="divider m-0" />
            <li>
              <label className="grid-cols-[1fr_min-content]">
                {t('actions.signOut')}
                <button
                  type="button"
                  className="btn btn-circle btn-btn-ghost btn-sm flex size-4 items-center"
                  onClick={logout}
                >
                  <ExitIcon />
                </button>
              </label>
            </li>
          </>
        )}
      </ul>
    </div>
  )
}
