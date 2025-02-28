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
  const { isAuthenticated, login, logout, profileUrl, user } = useAuth()

  return (
    <nav className="navbar bg-base-200 rounded-box shadow-xl mt-10 mb-10 z-50 sticky top-10">
      <div className="lg:hidden flex w-full items-center justify-between">
        <Link to="/" className="btn btn-ghost">
          <BowlerHatIcon className="size-8" />
        </Link>

        {isAuthenticated && user?.name ? (
          <Link to={profileUrl} className="btn btn-ghost gap-2">
            {user.name}
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn-ghost gap-2"
            onClick={() => login?.()}
          >
            <UserIcon className="size-6" />
            {t('signIn')}
          </button>
        )}

        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost">
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
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/conversations/$">
                <ConversationIcon className="size-6" />
                {t('conversations')}
              </Link>
            </li>
            <li>
              <Link to="/assistants">
                <BowlerHatIcon className="size-6" />
                {t('assistants')}
              </Link>
            </li>
            <li>
              <Link to="/libraries">
                <AcademicCapIcon className="size-6" />
                {t('library')}
              </Link>
            </li>
            <li>
              <Link to="/langchain-chat">
                <ChatBubbleIcon className="size-6" />
                {t('chat')}
              </Link>
            </li>
            {!isAuthenticated ? (
              <li>
                <button type="button" onClick={() => login?.()}>
                  <UserIcon className="size-6" />
                  {t('signIn')}
                </button>
              </li>
            ) : (
              <>
                <li>
                  <button type="button" onClick={() => logout?.()}>
                    <UserIcon className="size-6" />
                    {t('signOut')}
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="hidden lg:flex w-full justify-between items-center">
        <TopNavigationLink to="/">
          <BowlerHatIcon className="size-8" />
          {t('brand')}
        </TopNavigationLink>

        <div className="flex gap-4">
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
        <div>
          {!isAuthenticated ? (
            <button
              type="button"
              className="btn btn-ghost gap-2"
              onClick={() => login?.()}
            >
              <UserIcon className="size-6" />
              {t('signIn')}
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
                {t('signOut')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default TopNavigation
