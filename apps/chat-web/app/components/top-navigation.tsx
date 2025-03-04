import { JSX } from 'react'
import { Link } from '@tanstack/react-router'
import BowlerHatIcon from '../icons/bowler-hat-icon'
import ChatBubbleIcon from '../icons/chat-bubble-icon'
import UserIcon from '../icons/user-icon'
import AcademicCapIcon from '../icons/academic-cap-icon'
import { useAuth } from '../auth/auth-hook'
import { t } from 'i18next'
import { FileRoutesByTo } from '../routeTree.gen'
import { ConversationIcon } from '../icons/conversation-icon'
const TopNavigationLink = ({
  to,
  children,
}: {
  to: keyof FileRoutesByTo
  children: Array<JSX.Element | string>
}) => {
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
  const { user, login, logout } = useAuth()

  return (
    <nav className="navbar  bg-base-200 rounded-box shadow-xl mt-10 mb-10 z-50 sticky top-10">
      <div className="navbar-start">
        <TopNavigationLink to="/">
          <BowlerHatIcon className="size-8" />
          {t('brand')}
        </TopNavigationLink>
      </div>
      <div className="navbar-center">
        <TopNavigationLink to="/conversations/$">
          <ConversationIcon className="size-6" />
          {t('conversations')}
        </TopNavigationLink>
        <TopNavigationLink to="/assistants">
          <BowlerHatIcon className="size-6" />
          {t('assistants')}
        </TopNavigationLink>
        <TopNavigationLink to="/libraries">
          <AcademicCapIcon className="size-6" />
          {t('library')}
        </TopNavigationLink>
        <TopNavigationLink to="/langchain-chat">
          <ChatBubbleIcon className="size-6" />
          {t('chat')}
        </TopNavigationLink>
      </div>
      <div className="navbar-end">
        {!user ? (
          <button
            type="button"
            className="btn btn-ghost gap-2"
            onClick={() => login()}
          >
            <UserIcon className="size-6" />
            <span>{t('signIn')}</span>
          </button>
        ) : (
          <>
            <Link to={user.profileUrl} className="btn btn-ghost gap-2">
              {user?.name}
            </Link>
            <button
              type="button"
              className="btn btn-ghost gap-2"
              onClick={() => logout()}
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