import { JSX } from 'react'
import { Link } from '@tanstack/react-router'
import BowlerHatIcon from '../icons/bowler-hat-icon'
import ChatBubbleIcon from '../icons/chat-bubble-icon'
import UserIcon from '../icons/user-icon'
import AcademicCapIcon from '../icons/academic-cap-icon'
import { useAuth } from '../auth/auth-context'
import { t } from 'i18next'
import { FileRoutesByTo } from '../routeTree.gen'
import { ConversationIcon } from '../icons/conversation-icon'
import { useState } from 'react'

const TopNavigationLink = ({
  to,
  children,
  className = '',
}: {
  to: keyof FileRoutesByTo
  children: Array<JSX.Element | string>
  className?: string
}) => {
  return (
    <Link
      to={to}
      className={`btn btn-ghost ${className}`}
      activeProps={{ className: 'btn-active' }}
      activeOptions={{ exact: false }}
    >
      {children}
    </Link>
  )
}

const TopNavigation = () => {
  const { isAuthenticated, login, logout, profileUrl, user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="navbar bg-base-200 rounded-box shadow-xl mt-10 mb-10 z-50 sticky top-10">
      <div className="navbar-start">
        <div className="dropdown">
          <button
            type="button"
            className="btn btn-ghost lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          {isMenuOpen && (
            <ul className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <TopNavigationLink to="/">
                  <BowlerHatIcon className="size-8" />
                  {t('brand')}
                </TopNavigationLink>
              </li>
              <li>
                <TopNavigationLink to="/conversations/$">
                  <ConversationIcon className="size-6" />
                  {t('conversations')}
                </TopNavigationLink>
              </li>
              <li>
                <TopNavigationLink to="/assistants">
                  <BowlerHatIcon className="size-6" />
                  {t('assistants')}
                </TopNavigationLink>
              </li>
              <li>
                <TopNavigationLink to="/libraries">
                  <AcademicCapIcon className="size-6" />
                  {t('library')}
                </TopNavigationLink>
              </li>
              <li>
                <TopNavigationLink to="/langchain-chat">
                  <ChatBubbleIcon className="size-6" />
                  {t('chat')}
                </TopNavigationLink>
              </li>
              <li>
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
              </li>
            </ul>
          )}
        </div>
        <TopNavigationLink to="/" className="hidden lg:flex">
          <BowlerHatIcon className="size-8" />
          {t('brand')}
        </TopNavigationLink>
      </div>
      <div className="navbar-center hidden lg:flex">
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
      <div className="navbar-end hidden lg:flex">
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
