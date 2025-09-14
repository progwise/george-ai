import { Link } from '@tanstack/react-router'
import { JSX } from 'react'

import { useAuth } from '../auth/auth'
import { useTheme } from '../hooks/use-theme'
import { useLanguage } from '../i18n/use-language-hook'
import { useTranslation } from '../i18n/use-translation-hook'
import { ExitIcon } from '../icons/exit-icon'
import { MenuEllipsisIcon } from '../icons/menu-ellipsis-icon'
import MoonIcon from '../icons/moon-icon'
import SunIcon from '../icons/sun-icon'
import SystemIcon from '../icons/system-icon'
import { UserAvatar } from './user-avatar'

interface User {
  id: string
  username: string
  name?: string | null
  isAdmin: boolean
  avatarUrl?: string | null
}

interface SettingsDropdownProps {
  user?: User
}

export const SettingsDropdown = ({ user }: SettingsDropdownProps): JSX.Element => {
  const { t } = useTranslation()
  const { logout, isReady } = useAuth()
  const { language, setLanguage } = useLanguage()
  const [theme, setTheme] = useTheme()

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(event.target.value as 'light' | 'dark' | 'system')
  }

  return (
    <div className="dropdown dropdown-hover dropdown-end">
      {/* Menu button */}
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle hover:scale-115 list-none transition-all"
        aria-label="User menu"
      >
        {user ? <UserAvatar user={user} className="size-10" /> : <MenuEllipsisIcon className="size-6" />}
      </div>

      <ul tabIndex={0} className="dropdown-content menu rounded-box bg-base-200 min-w-55 shadow-sm">
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
                <span className="truncate">{user.name || user.username}</span>
              </Link>
            </li>

            {/* Admin link - only visible to admins */}
            {user.isAdmin && (
              <li>
                <Link
                  to="/admin"
                  onClick={() => {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur()
                    }
                  }}
                >
                  <span className="truncate">{t('topNavigation.admin')}</span>
                </Link>
              </li>
            )}

            <div className="divider m-0" />
          </>
        )}

        {/* Sign-In for unauthenticated users */}
        {isReady && !user && (
          <>
            <li>
              <Link to="/login" className="grid-cols-[1fr_min-content]">
                {t('actions.signIn')}
              </Link>
            </li>
            <div className="divider m-0" />
          </>
        )}

        {/* Theme-Switcher */}
        <li>
          <div className="grid w-full grid-cols-[1fr_min-content] items-center">
            <span className="text-sm">{t('settings.theme')}</span>
            <div className="bg-base-100 flex items-center gap-2 rounded-lg px-2 py-1 shadow">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={theme === 'system'}
                  onChange={handleThemeChange}
                  className="hidden"
                  aria-label={t('settings.systemMode') ?? 'System'}
                />
                <span
                  title={t('settings.systemMode') ?? 'System'}
                  className={`btn btn-ghost btn-xs rounded-full p-1 ${theme === 'system' ? 'bg-base-300' : ''}`}
                  tabIndex={-1}
                >
                  <SystemIcon className="size-4" />
                </span>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={handleThemeChange}
                  className="hidden"
                  aria-label={t('settings.lightMode')}
                />
                <span
                  title={t('settings.lightMode')}
                  className={`btn btn-ghost btn-xs rounded-full p-1 ${theme === 'light' ? 'bg-base-300' : ''}`}
                  tabIndex={-1}
                >
                  <SunIcon className="size-4" />
                </span>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={handleThemeChange}
                  className="hidden"
                  aria-label={t('settings.darkMode')}
                />
                <span
                  title={t('settings.darkMode')}
                  className={`btn btn-ghost btn-xs rounded-full p-1 ${theme === 'dark' ? 'bg-base-300' : ''}`}
                  tabIndex={-1}
                >
                  <MoonIcon className="size-4" />
                </span>
              </label>
            </div>
          </div>
        </li>

        {/* Language-Switcher */}
        <li>
          <div className="grid w-full grid-cols-[1fr_min-content] items-center">
            <span className="text-sm">{t('settings.language')}</span>
            <div className="bg-base-100 flex items-center gap-2 rounded-lg px-2 py-1 shadow">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-label="Switch to English"
                title="English"
                className={`btn btn-ghost btn-xs rounded-full px-2 font-bold ${language === 'en' ? 'bg-base-300' : ''}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('de')}
                aria-label="Switch to German"
                title="Deutsch"
                className={`btn btn-ghost btn-xs rounded-full px-2 font-bold ${language === 'de' ? 'bg-base-300' : ''}`}
              >
                DE
              </button>
            </div>
          </div>
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
                  className="btn btn-circle btn-ghost btn-sm flex size-4 items-center"
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
