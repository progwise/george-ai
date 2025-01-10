import { Link } from '@tanstack/react-router'
import BowlerHatIcon from './icons/bowler-hat-icon'
import ChatBubbleIcon from './icons/chat-bubble-icon'
import PhoneIcon from './icons/phone-icon'
import UserIcon from './icons/user-icon'
import { useAuth } from '../auth'

const TopNavigation = () => {
  const authContext = useAuth()
  const { isAuthenticated, login, logout, user, profileUrl } = authContext ?? {}
  return (
    <nav className="navbar  bg-base-200 rounded-box shadow-xl mt-10 mb-10 z-50 sticky top-10">
      <div className="navbar-start">
        <Link className="btn btn-ghost" to="/">
          <BowlerHatIcon className="size-8" />
          George AI
        </Link>
      </div>
      <div className="navbar-center">
        <Link className="btn btn-ghost" to="/langchain-chat">
          <ChatBubbleIcon className="size-6" />
          Chat playground
        </Link>
        <Link className="btn btn-ghost" to="/contact">
          <PhoneIcon className="size-6" />
          Contact
        </Link>
      </div>
      <div className="navbar-end">
        {!isAuthenticated && (
          <>
            <Link className="btn btn-ghost" to="/profile">
              {user}
            </Link>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => login?.()}
            >
              <UserIcon className="size-6" />
              Sign in
            </button>
          </>
        )}
        {isAuthenticated && (
          <>
            <Link className="btn btn-ghost" to={profileUrl}>
              {user}
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
