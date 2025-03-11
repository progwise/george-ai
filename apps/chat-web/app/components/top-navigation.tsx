import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'
import { useRef, useState } from 'react'

import { useAuth } from '../auth/auth-hook'
import { useTranslation } from '../i18n/use-translation-hook'
import AcademicCapIcon from '../icons/academic-cap-icon'
import BowlerHatIcon from '../icons/bowler-hat-icon'
import ChatBubbleIcon from '../icons/chat-bubble-icon'
import { ConversationIcon } from '../icons/conversation-icon'
import { MenuIcon } from '../icons/menu-icon'
import UserIcon from '../icons/user-icon'
import { FileRoutesByTo } from '../routeTree.gen'

const TopNavigationLink = ({ to, children }: { to: keyof FileRoutesByTo; children: ReactNode }) => {
  return (
    <Link to={to} className="btn btn-ghost" activeProps={{ className: 'btn-active' }} activeOptions={{ exact: false }}>
      {children}
    </Link>
  )
}

const TopNavigation = () => {
  const { t } = useTranslation()
  const { user, login, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const drawerCheckboxReference = useRef<HTMLInputElement>(null)

  const closeMenu = () => {
    setIsMenuOpen(false)
    if (drawerCheckboxReference.current) {
      drawerCheckboxReference.current.checked = false
    }
  }

  return (
    <nav className="navbar sticky top-2 z-50 mb-6 rounded-box bg-base-200 shadow-xl lg:top-10 lg:mb-14">
      <div className="flex w-full items-center justify-between lg:hidden">
        <Link to="/" className="btn btn-ghost">
          <BowlerHatIcon className="size-8" />
        </Link>

        {user ? (
          <Link to="/profile" className="btn btn-ghost gap-2">
            {user.name}
          </Link>
        ) : (
          <button type="button" className="btn btn-ghost gap-2" onClick={() => login()}>
            <UserIcon className="size-6" />
            {t('signIn')}
          </button>
        )}

        <div className="dropdown dropdown-end" ref={menuRef}>
          <label tabIndex={0} className="btn btn-ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MenuIcon className="size-6" />
          </label>
          {isMenuOpen && (
            <ul
              tabIndex={0}
              className="menu-compact menu dropdown-content mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li>
                <Link to="/conversations/$" onClick={closeMenu}>
                  <ConversationIcon className="size-6" />
                  {t('conversations')}
                </Link>
              </li>
              <li>
                <Link to="/assistants" onClick={closeMenu}>
                  <BowlerHatIcon className="size-6" />
                  {t('assistants')}
                </Link>
              </li>
              <li>
                <Link to="/libraries" onClick={closeMenu}>
                  <AcademicCapIcon className="size-6" />
                  {t('library')}
                </Link>
              </li>
              <li>
                <Link to="/langchain-chat" onClick={closeMenu}>
                  <ChatBubbleIcon className="size-6" />
                  {t('chat')}
                </Link>
              </li>
              {!user ? (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      login()
                      closeMenu()
                    }}
                  >
                    <UserIcon className="size-6" />
                    {t('signIn')}
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        closeMenu()
                      }}
                    >
                      <UserIcon className="size-6" />
                      {t('signOut')}
                    </button>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="hidden w-full items-center justify-between lg:flex">
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
        <div className="flex gap-2">
          {!user ? (
            <button type="button" className="btn btn-ghost gap-2" onClick={() => login()}>
              <UserIcon className="size-6" />
              {t('signIn')}
            </button>
          ) : (
            <>
              <TopNavigationLink to="/profile">{user?.name || 'no name'}</TopNavigationLink>
              <button type="button" className="btn btn-ghost gap-2" onClick={() => logout()}>
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
