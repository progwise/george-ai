import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'

import { UserFragment } from '../gql/graphql'
import { useTranslation } from '../i18n/use-translation-hook'
import { BowlerLogoIcon } from '../icons/bowler-logo-icon'
import { ConversationIcon } from '../icons/conversation-icon'
import { LibraryIcon } from '../icons/library-icon'
import { LinkIcon } from '../icons/link-icon'
import { ListViewIcon } from '../icons/list-view-icon'
import UserIcon from '../icons/user-icon'
import { FileRoutesByTo } from '../routeTree.gen'

interface SidebarNavigationLinkProps {
  to: keyof FileRoutesByTo
  icon: ReactNode
  label: string
  tooltip?: string
}

const SidebarNavigationLink = ({ to, icon, label, tooltip }: SidebarNavigationLinkProps) => (
  <li>
    <Link
      to={to}
      className="transition-colors is-drawer-close:tooltip is-drawer-close:tooltip-right"
      data-tip={tooltip || label}
      inactiveProps={{ className: 'hover:animate-pulse' }}
      activeProps={{ className: 'bg-accent/40' }} // TODO
      activeOptions={{ exact: false }}
    >
      {icon}
      <span className="is-drawer-close:hidden">{label}</span>
    </Link>
  </li>
)

interface SidebarProps {
  user: UserFragment | null
}

export function Sidebar({ user }: SidebarProps) {
  const { t } = useTranslation()

  if (!user) {
    return null
  }

  return (
    <div className="group drawer-side transition-all duration-200 ease-in is-drawer-close:overflow-visible">
      <label htmlFor="sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
      <div className="fixed top-0 left-0 flex min-h-full flex-col bg-base-300 is-drawer-close:w-14 is-drawer-open:w-64">
        <label
          htmlFor="sidebar"
          aria-label={t('sidebar.toggle')} // TODO
          className="btn absolute inset-y-2 right-2 z-10 btn-square bg-base-300 btn-ghost hover:cursor-ew-resize hover:brightness-150 is-drawer-close:invisible is-drawer-close:group-hover:visible"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2"
            fill="none"
            stroke="currentColor"
            className="my-1.5 inline-block size-6.5"
          >
            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
            <path d="M9 4v16"></path>
            <path d="M14 10l2 2l-2 2"></path>
          </svg>
          <span className="sr-only is-drawer-close:block is-drawer-open:hidden">{t('sidebar.open')}</span>
          <span className="sr-only is-drawer-close:hidden is-drawer-open:block">{t('sidebar.close')}</span>
        </label>
        <div className="absolute inset-y-2 is-drawer-open:pointer-events-auto">
          <Link to="/">
            <BowlerLogoIcon className="absolute inset-y-2 left-4 size-6" />
            <span className="absolute inset-x-12 inset-y-2.5 font-extrabold is-drawer-close:hidden">George</span>
          </Link>
        </div>

        <ul className="menu absolute inset-y-14 w-full grow is-drawer-open:pointer-events-auto">
          <SidebarNavigationLink
            to="/libraries"
            icon={<LibraryIcon className="my-1.5 inline-block size-4" />}
            label={t('sidebar.library')}
          />
          <SidebarNavigationLink
            to="/lists"
            icon={<ListViewIcon className="my-1.5 inline-block size-4" />}
            label={t('sidebar.lists')}
          />
          <SidebarNavigationLink
            to="/automations"
            icon={<LinkIcon className="my-1.5 inline-block size-4" />}
            label={t('sidebar.automations')}
          />
          <SidebarNavigationLink
            to="/conversations"
            icon={<ConversationIcon className="my-1.5 inline-block size-4" />}
            label={t('sidebar.conversations')}
          />
          <SidebarNavigationLink
            to="/assistants"
            icon={<UserIcon className="my-1.5 inline-block size-4" />}
            label={t('sidebar.assistants')}
          />
        </ul>
      </div>
    </div>
  )
}
