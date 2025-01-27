import { Link } from '@tanstack/react-router'
import BowlerHatIcon from './icons/bowler-hat-icon'
import ChatBubbleIcon from './icons/chat-bubble-icon'
import AcademicCapIcon from './icons/academic-cap-icon'
import UserIcon from './icons/user-icon'
import { useAuth } from '../auth'

const TopNavigation = () => {
  const authContext = useAuth()
  const { isAuthenticated, login, logout, user, profileUrl } = authContext ?? {}

  return (
    <nav className="navbar bg-base-200 rounded-box shadow-xl mt-10 mb-10 sticky top-10 z-50">
      <div className="navbar-start">
        <div className="dropdown">
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
            className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/langchain-chat">
                <ChatBubbleIcon className="size-6" />
                Chat
              </Link>
            </li>
            <li>
              <Link to="/assistants">
                <AcademicCapIcon className="size-6" />
                Assistants
              </Link>
            </li>
            {!isAuthenticated ? (
              <li>
                <button type="button" onClick={() => login?.()}>
                  <UserIcon className="size-6" />
                  Sign in
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link to={profileUrl}>{user?.name}</Link>
                </li>
                <li>
                  <button type="button" onClick={() => logout?.()}>
                    <UserIcon className="size-6" />
                    Sign out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="navbar-center gap-2">
        <Link
          to="/langchain-chat"
          className="hidden sm:inline-flex btn btn-ghost"
        >
          <ChatBubbleIcon className="size-6" />
        </Link>

        <Link to="/assistants" className="hidden md:inline-flex btn btn-ghost">
          <AcademicCapIcon className="size-6" />
        </Link>

        {!isAuthenticated ? (
          <button
            type="button"
            className="hidden lg:inline-flex btn btn-ghost"
            onClick={() => login?.()}
          >
            <UserIcon className="size-6" />
            Sign in
          </button>
        ) : (
          <>
            <Link
              to={profileUrl}
              className="hidden lg:inline-flex btn btn-ghost"
            >
              {user?.name}
            </Link>
            <button
              type="button"
              className="hidden lg:inline-flex btn btn-ghost"
              onClick={() => logout?.()}
            >
              <UserIcon className="size-6" />
              Sign out
            </button>
          </>
        )}
      </div>
      <div className="navbar-end">
        <Link className="btn btn-ghost" to="/">
          <BowlerHatIcon className="size-8" />
          George Ai
        </Link>
      </div>
    </nav>
  )
}

export default TopNavigation
