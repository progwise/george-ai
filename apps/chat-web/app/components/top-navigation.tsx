import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'

import { useAuth } from '../auth/auth'
import { User } from '../gql/graphql'
import { useTranslation } from '../i18n/use-translation-hook'
import AcademicCapIcon from '../icons/academic-cap-icon'
import BowlerHatIcon from '../icons/bowler-hat-icon'
import BowlerLogoIcon from '../icons/bowler-logo-icon'
import { CalendarIcon } from '../icons/calendar-icon'
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

interface TopNavigationProps {
  user?: Pick<User, 'id' | 'name'>
}

const TopNavigation = ({ user }: TopNavigationProps) => {
  const { t } = useTranslation()
  const { login, logout } = useAuth()

  return (
    <nav className="navbar sticky top-2 z-50 mb-4 rounded-box bg-base-200 shadow-xl">
      <div className="flex w-full justify-between lg:hidden">
        <div className="flex items-center gap-2">
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
            <CalendarIcon className="size-6" />
          </a>
        </div>
        {user ? (
          <Link to="/profile" className="btn btn-ghost gap-2">
            <span className="max-w-48 truncate">{user.name}</span>
          </Link>
        ) : (
          <button type="button" className="btn btn-ghost gap-2" onClick={() => login()}>
            <UserIcon className="size-6" />
            {t('actions.signIn')}
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
              <TopNavigationLink to="/profile">
                <span className="max-w-40 truncate">{user?.name || 'no name'}</span>
              </TopNavigationLink>
              <button type="button" className="btn btn-ghost gap-2" onClick={() => logout()}>
                <UserIcon className="size-6" />
                {t('actions.signOut')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default TopNavigation
