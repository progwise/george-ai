import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ReactNode, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { UserFragment } from '../gql/graphql'
import { useTranslation } from '../i18n/use-translation-hook'
import { BowlerLogoIcon } from '../icons/bowler-logo-icon'
import { ConversationIcon } from '../icons/conversation-icon'
import { LibraryIcon } from '../icons/library-icon'
import { LinkIcon } from '../icons/link-icon'
import { ListViewIcon } from '../icons/list-view-icon'
import UserIcon from '../icons/user-icon'
import { UsersIcon } from '../icons/users-icon'
import { FileRoutesByTo } from '../routeTree.gen'
import { getAutomationsQueryOptions } from './automations/queries'
import { getLibrariesQueryOptions } from './library/queries/get-libraries'
import { getListsQueryOptions } from './lists/queries'
import { WorkspaceMembersDialog } from './workspace/members/workspace-members-dialog'

interface SidebarNavigationLinkProps {
  to: keyof FileRoutesByTo
  icon: ReactNode
  label: string
  className?: string
}

const SidebarNavigationLink = ({ to, icon, label, className }: SidebarNavigationLinkProps) => (
  <Link
    to={to}
    className={twMerge('transition-colors is-drawer-close:tooltip is-drawer-close:tooltip-right', className)}
    data-tip={label}
    inactiveProps={{ className: 'hover:animate-pulse' }}
    activeProps={{ className: 'bg-accent/40' }}
    activeOptions={{ exact: false }}
  >
    {icon}
    <span className="is-drawer-close:hidden">{label}</span>
  </Link>
)

interface SidebarProps {
  user: UserFragment
  workspaceId: string | null
  isDrawerOpen: boolean
}

export function Sidebar({ user, workspaceId, isDrawerOpen }: SidebarProps) {
  const { t } = useTranslation()
  const membersDialogRef = useRef<HTMLDialogElement>(null)
  const {
    data: { aiLibraries },
  } = useSuspenseQuery(getLibrariesQueryOptions())
  console.log('Libs:', aiLibraries)
  const {
    data: { aiLists },
  } = useSuspenseQuery(getListsQueryOptions())
  const {
    data: { automations },
  } = useSuspenseQuery(getAutomationsQueryOptions())

  return (
    <div className="group/sidebar drawer-side z-50 transition-all duration-200 ease-in is-drawer-close:overflow-visible">
      <label htmlFor="sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
      <div className="fixed top-0 left-0 flex min-h-full flex-col bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
        <label
          htmlFor="sidebar"
          aria-label={t('sidebar.toggle')}
          className="btn absolute inset-y-2 right-2 z-10 btn-square bg-base-200 btn-ghost hover:cursor-ew-resize hover:brightness-150 is-drawer-close:invisible is-drawer-close:group-hover/sidebar:visible"
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
        <div className="absolute inset-y-2">
          <Link to="/">
            <BowlerLogoIcon className="absolute inset-y-2 left-4 size-6" />
            <span className="absolute inset-x-12 inset-y-2.5 font-extrabold is-drawer-close:hidden">George</span>
          </Link>
        </div>

        <ul className="menu absolute inset-y-14 w-full grow lg:menu-vertical">
          <li>
            <button
              type="button"
              onClick={() => membersDialogRef.current?.showModal()}
              className="transition-colors hover:animate-pulse is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={t('workspace.members.title')}
              aria-label={t('workspace.members.title')}
            >
              <UsersIcon className="my-1.5 inline-block size-4" />
              <span className="whitespace-nowrap is-drawer-close:hidden">{t('workspace.members.title')}</span>
            </button>
          </li>

          <li className="pointer-events-none">
            <div className="divider my-0" />
          </li>

          <li className="group/libraries relative">
            {isDrawerOpen ? (
              <details>
                <summary>
                  <LibraryIcon className="my-1.5 inline-block size-4" />
                  {t('sidebar.libraries')}
                </summary>
                <ul>
                  {aiLibraries?.map((lib) => (
                    <li key={lib.id}>
                      <Link
                        to="/libraries/$libraryId"
                        params={{ libraryId: lib.id }}
                        activeProps={{ className: 'bg-accent/40' }}
                      >
                        {lib.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <>
                <SidebarNavigationLink
                  to="/libraries"
                  icon={<LibraryIcon className="my-1.5 inline-block size-4" />}
                  label=""
                />
                {aiLibraries.length > 0 && (
                  <>
                    <ul className="invisible absolute top-0 left-10 min-w-96 rounded-box bg-base-200 p-2 opacity-0 transition-all duration-200 not-[&:hover]:delay-200 group-hover/libraries:visible group-hover/libraries:opacity-100">
                      {aiLibraries?.map((lib) => (
                        <li key={lib.id}>
                          <Link
                            to="/libraries/$libraryId"
                            params={{ libraryId: lib.id }}
                            activeProps={{ className: 'bg-accent/40' }}
                            className="block px-4 py-2"
                          >
                            {lib.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </li>

          <li className="group/lists relative">
            {isDrawerOpen ? (
              <details>
                <summary>
                  <ListViewIcon className="my-1.5 inline-block size-4" />
                  {t('sidebar.lists')}
                </summary>
                <ul>
                  {aiLists?.map((list) => (
                    <li key={list.id}>
                      <Link
                        to="/lists/$listId"
                        params={{ listId: list.id }}
                        activeProps={{ className: 'bg-accent/40' }}
                      >
                        {list.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <>
                <SidebarNavigationLink
                  to="/lists"
                  icon={<ListViewIcon className="my-1.5 inline-block size-4" />}
                  label=""
                />
                {aiLists.length > 0 && (
                  <>
                    <ul className="invisible absolute top-0 left-10 min-w-96 rounded-box bg-base-200 p-2 opacity-0 transition-all duration-200 not-[&:hover]:delay-200 group-hover/lists:visible group-hover/lists:opacity-100">
                      {aiLists.map((list) => (
                        <li key={list.id}>
                          <Link
                            to="/lists/$listId"
                            params={{ listId: list.id }}
                            activeProps={{ className: 'bg-accent/40' }}
                            className="block px-4 py-2"
                          >
                            {list.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </li>

          <li className="group/automations relative">
            {isDrawerOpen ? (
              <details>
                <summary>
                  <LinkIcon className="my-1.5 inline-block size-4" />
                  {t('sidebar.automations')}
                </summary>
                <ul>
                  {automations &&
                    automations?.map((automations) => (
                      <li key={automations.id}>
                        <Link
                          to="/automations/$automationId"
                          params={{ automationId: automations.id }}
                          activeProps={{ className: 'bg-accent/40' }}
                        >
                          {automations.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </details>
            ) : (
              <>
                <SidebarNavigationLink
                  to="/automations"
                  icon={<LinkIcon className="my-1.5 inline-block size-4" />}
                  label=""
                />
                {automations.length > 0 && (
                  <>
                    <ul className="invisible absolute top-0 left-10 min-w-96 rounded-box bg-base-200 p-2 opacity-0 transition-all duration-200 not-[&:hover]:delay-200 group-hover/automations:visible group-hover/automations:opacity-100">
                      {automations?.map((automation) => (
                        <li key={automation.id}>
                          <Link
                            to="/automations/$automationId"
                            params={{ automationId: automation.id }}
                            activeProps={{ className: 'bg-accent/40' }}
                            className="block px-4 py-2"
                          >
                            {automation.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </li>

          <li>
            <SidebarNavigationLink
              to="/conversations"
              icon={<ConversationIcon className="my-1.5 inline-block size-4" />}
              label={t('sidebar.conversations')}
            />
          </li>
          <li>
            <SidebarNavigationLink
              to="/assistants"
              icon={<UserIcon className="my-1.5 inline-block size-4" />}
              label={t('sidebar.assistants')}
            />
          </li>
          <li className="pointer-events-none">
            <div className="divider my-0" />
          </li>
        </ul>
      </div>
      {workspaceId && <WorkspaceMembersDialog user={user} ref={membersDialogRef} />}
    </div>
  )
}
