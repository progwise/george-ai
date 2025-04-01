import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'

import { useAuth } from '../auth/auth-hook'
import { useTranslation } from '../i18n/use-translation-hook'
import AcademicCapIcon from '../icons/academic-cap-icon'
import BowlerHatIcon from '../icons/bowler-hat-icon'
import BowlerLogoIcon from '../icons/bowler-logo-icon'
import { ConversationIcon } from '../icons/conversation-icon'
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

  return (
    <nav className="navbar sticky top-2 z-50 mb-6 rounded-box bg-base-200 shadow-xl">
      <div className="flex w-full items-center justify-between lg:hidden">
        <Link to="/" className="btn btn-ghost">
          <BowlerLogoIcon className="size-8" />
        </Link>

        <a
          href="https://calendly.com/michael-vogt-progwise/30min"
          target="_blank"
          rel="noopener noreferrer"
          type="button"
          className="btn btn-accent"
        >
          {t('topNavigation.demo')}
        </a>

        {user ? (
          <Link to="/profile" className="btn btn-ghost gap-2">
            {user.name}
          </Link>
        ) : (
          <button type="button" className="btn btn-ghost gap-2" onClick={() => login()}>
            <UserIcon className="size-6" />
            {t('topNavigation.signIn')}
          </button>
        )}
      </div>

      <div className="join fixed bottom-0 left-0 right-0 z-50 justify-around bg-base-200 lg:hidden">
        <Link to="/conversations/$" className="join-item flex flex-col items-center">
          <ConversationIcon className="size-6" />
          <span className="dock-label">{t('topNavigation.conversations')}</span>
        </Link>
        <Link to="/assistants" className="join-item flex flex-col items-center">
          <BowlerHatIcon className="size-6" />
          {t('topNavigation.assistants')}
        </Link>
        <Link to="/libraries" className="join-item flex flex-col items-center">
          <AcademicCapIcon className="size-6" />
          {t('topNavigation.libraries')}
        </Link>

        {!user ? (
          <button
            type="button"
            onClick={() => {
              login()
            }}
            className="join-item flex flex-col items-center"
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
            className="join-item flex flex-col items-center"
          >
            <UserIcon className="size-6" />
            {t('topNavigation.signOut')}
          </button>
        )}
      </div>

      <div className="hidden w-full items-center justify-between lg:flex">
        <TopNavigationLink to="/">
          <BowlerLogoIcon className="size-8" />
          {t('brand')}
        </TopNavigationLink>

        <div className="flex gap-4">
          <TopNavigationLink to="/conversations/$">
            <ConversationIcon className="size-6" />
            {t('topNavigation.conversations')}
          </TopNavigationLink>
          <TopNavigationLink to="/assistants">
            <BowlerHatIcon className="size-6" />
            {t('topNavigation.assistants')}
          </TopNavigationLink>
          <TopNavigationLink to="/libraries">
            <AcademicCapIcon className="size-6" />
            {t('topNavigation.libraries')}
          </TopNavigationLink>
        </div>
        <div className="flex gap-2">
          {!user ? (
            <>
              <a
                href="https://calendly.com/michael-vogt-progwise/30min"
                target="_blank"
                rel="noopener noreferrer"
                type="button"
                className="btn- btn btn-accent"
              >
                {t('topNavigation.demo')}
              </a>

              <button type="button" className="btn btn-ghost gap-2" onClick={() => login()}>
                <UserIcon className="size-6" />
                {t('topNavigation.signIn')}
              </button>
            </>
          ) : (
            <>
              <TopNavigationLink to="/profile">{user?.name || 'no name'}</TopNavigationLink>
              <button type="button" className="btn btn-ghost gap-2" onClick={() => logout()}>
                <UserIcon className="size-6" />
                {t('topNavigation.signOut')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default TopNavigation
