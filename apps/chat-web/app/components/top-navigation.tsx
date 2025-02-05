import { Link } from '@tanstack/react-router'
import BowlerHatIcon from './icons/bowler-hat-icon'
import ChatBubbleIcon from './icons/chat-bubble-icon'
import UserIcon from './icons/user-icon'
import AcademicCapIcon from './icons/academic-cap-icon'
import { useAuth } from '../auth/auth-context'
import { t } from 'i18next'

const TopNavigationLink = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="btn btn-ghost"
      activeProps={{ className: 'btn-active' }}
      activeOptions={{ exact: false }}
    >
      {children}
    </Link>
  )
}

const TopNavigation = () => {
  const { isAuthenticated, login, logout, profileUrl, user } = useAuth()

  return (
    <nav className="navbar  bg-base-200 rounded-box shadow-xl mt-10 mb-10 z-50 sticky top-10">
      <div className="navbar-start">
        <TopNavigationLink to="/">
          <BowlerHatIcon className="size-8" />
          {t('brand')}
        </TopNavigationLink>
      </div>
      <div className="navbar-center">
        <TopNavigationLink to="/assistants">
          <ChatBubbleIcon className="size-6" />
          {t('assistants')}
        </TopNavigationLink>
        <TopNavigationLink to="/knowledge">
          <AcademicCapIcon className="size-6" />
          {t('library')}
        </TopNavigationLink>
        <TopNavigationLink to="/langchain-chat">
          <ChatBubbleIcon className="size-6" />
          {t('chat')}
        </TopNavigationLink>
      </div>
      <div className="navbar-end">
        {!isAuthenticated ? (
          <button
            type="button"
            className="btn btn-ghost gap-2"
            onClick={() => login?.()}
          >
            <UserIcon className="size-6" />
            <span>{t('signIn')}</span>
          </button>
        ) : (
          <>
            <Link to={profileUrl} className="btn btn-ghost gap-2">
              {user?.name}
            </Link>
            <button
              type="button"
              className="btn btn-ghost gap-2"
              onClick={() => logout?.()}
            >
              <UserIcon className="size-6" />
              <span>{t('signOut')}</span>
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default TopNavigation
