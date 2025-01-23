import { Link } from '@tanstack/react-router'
import BowlerHatIcon from './icons/bowler-hat-icon'
import ChatBubbleIcon from './icons/chat-bubble-icon'
import UserIcon from './icons/user-icon'
import { useAuth } from '../auth'
import AcademicCapIcon from './icons/academic-cap-icon'

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
  const authContext = useAuth()
  const { isAuthenticated, login, logout, user, profileUrl } = authContext ?? {}
  return (
    <nav className="navbar  bg-base-200 rounded-box shadow-xl mt-10 mb-10 z-50 sticky top-10">
      <div className="navbar-start">
        <TopNavigationLink to="/">
          <BowlerHatIcon className="size-8" />
          George Ai
        </TopNavigationLink>
      </div>
      <div className="navbar-center">
        <TopNavigationLink to="/assistants">
          <ChatBubbleIcon className="size-6" />
          Assistants
        </TopNavigationLink>
        <TopNavigationLink to="/knowledge">
          <AcademicCapIcon className="size-6" />
          Knowledge Sources
        </TopNavigationLink>
        <TopNavigationLink to="/langchain-chat">
          <ChatBubbleIcon className="size-6" />
          Chat
        </TopNavigationLink>
      </div>
      <div className="navbar-end">
        {!isAuthenticated ? (
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => login?.()}
            >
              <UserIcon className="size-6" />
              Sign in
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-ghost" to={profileUrl}>
              {user?.name}
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => logout?.()}
            >
              <UserIcon className="size-6" />
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default TopNavigation
