import { Link } from '@tanstack/react-router'

import { useAuth } from '../auth/auth-hook'
import { useTranslation } from '../i18n/use-translation-hook'
import AcademicCapIcon from '../icons/academic-cap-icon'
import BowlerHatIcon from '../icons/bowler-hat-icon'
import { ConversationIcon } from '../icons/conversation-icon'
import UserIcon from '../icons/user-icon'

const BottomNavigationMobile = () => {
  const { t } = useTranslation()
  const { user, login, logout } = useAuth()

  return (
    <nav className="navbar sticky bottom-2 z-40 rounded-box bg-base-200 shadow-xl lg:hidden">
      <div className="flex w-full">
        <Link to="/conversations/$" className="flex flex-1 flex-col items-center">
          <ConversationIcon className="size-6" />
          <span className="dock-label">{t('topNavigation.conversations')}</span>
        </Link>
        <Link to="/assistants" className="flex flex-1 flex-col items-center">
          <BowlerHatIcon className="size-6" />
          {t('topNavigation.assistants')}
        </Link>
        <Link to="/libraries" className="flex flex-1 flex-col items-center">
          <AcademicCapIcon className="size-6" />
          {t('topNavigation.libraries')}
        </Link>

        {!user ? (
          <button
            type="button"
            onClick={() => {
              login()
            }}
            className="flex flex-1 flex-col items-center"
          >
            <UserIcon className="size-6" />
            {t('topNavigation.signIn')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              logout()
            }}
            className="flex flex-1 flex-col items-center"
          >
            <UserIcon className="size-6" />
            {t('topNavigation.signOut')}
          </button>
        )}
      </div>
    </nav>
  )
}

export default BottomNavigationMobile
