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
    <nav className="navbar bg-base-200 rounded-box shadow-xl gap-2 z-50 sticky mb-10"> 
      <div className="navbar-start lg:hidden">
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
      <div className="navbar-end lg:hidden">
        <Link className="btn btn-ghost" to="/">
          <BowlerHatIcon className="size-8" />
          George Ai
        </Link>
      </div>

      <div className="hidden lg:flex w-full justify-evenly items-center">
        <Link to="/langchain-chat" className="btn btn-ghost gap-2">
          <ChatBubbleIcon className="size-6" />
          <span>Chat</span>
        </Link>

        <Link to="/assistants" className="btn btn-ghost gap-2">
          <AcademicCapIcon className="size-6" />
          <span>Assistants</span>
        </Link>
        {!isAuthenticated ? (
          <button
            type="button"
            className="btn btn-ghost gap-2"
            onClick={() => login?.()}
          >
            <UserIcon className="size-6" />
            <span>Sign in</span>
          </button>
        ) : (
          <>
            <Link to={profileUrl} className="btn btn-ghost">
            {user?.name}
            </Link>
            <button
              type="button"
              className="btn btn-ghost gap-2"
              onClick={() => logout?.()}
            >
              <UserIcon className="size-6" />
              <span>Sign out</span>
            </button>
          </>
        )}
        <Link className="btn btn-ghost gap-2" to="/">
          <BowlerHatIcon className="size-8" />
          <span>George Ai</span>
        </Link>
      </div>
    </nav>
  )
}

export default TopNavigation
