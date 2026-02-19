import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useRef } from 'react'

import 'tailwind-merge'

import { UserFragment } from '../gql/graphql'
import { useTranslation } from '../i18n/use-translation-hook'
import { BowlerLogoIcon } from '../icons/bowler-logo-icon'
import { ConversationIcon } from '../icons/conversation-icon'
import { LibraryIcon } from '../icons/library-icon'
import { LinkIcon } from '../icons/link-icon'
import { ListViewIcon } from '../icons/list-view-icon'
import { SidebarToggleIcon } from '../icons/sidebar-toggle-icon'
import UserIcon from '../icons/user-icon'
import { UsersIcon } from '../icons/users-icon'
import { getAutomationsQueryOptions } from './automations/queries'
import { ItemActionsDropdown } from './item-actions-dropdown'
import { getLibrariesQueryOptions } from './library/queries/get-libraries'
import { getListsQueryOptions } from './lists/queries'
import { ListSidebarCollapsibleMenu, SidebarNavigationLink } from './sidebar-menu-items'
import { WorkspaceMembersDialog } from './workspace/members/workspace-members-dialog'

interface SidebarProps {
  user: UserFragment
  workspaceId: string | null
  isDrawerOpen: boolean
  newLibraryDialogRef: React.RefObject<HTMLDialogElement | null>
  newListDialogRef: React.RefObject<HTMLDialogElement | null>
  newAutomationDialogRef: React.RefObject<HTMLDialogElement | null>
}

export function Sidebar({
  user,
  workspaceId,
  isDrawerOpen,
  newLibraryDialogRef,
  newListDialogRef,
  newAutomationDialogRef,
}: SidebarProps) {
  const { t } = useTranslation()
  const membersDialogRef = useRef<HTMLDialogElement>(null)
  const {
    data: { aiLibraries },
  } = useSuspenseQuery(getLibrariesQueryOptions())
  const {
    data: { aiLists },
  } = useSuspenseQuery(getListsQueryOptions())
  const {
    data: { automations },
  } = useSuspenseQuery(getAutomationsQueryOptions())

  if (!workspaceId) {
    workspaceId = user.defaultWorkspaceId
  }

  const sidebarToggleTooltip = isDrawerOpen ? t('sidebar.close') : t('sidebar.open')

  return (
    <div className="group/sidebar drawer-side z-60 transition-all duration-200 ease-in is-drawer-close:overflow-visible">
      <label htmlFor="sidebar" aria-label="sidebar" className="drawer-overlay" />
      <label
        className="fixed top-0 left-0 flex min-h-full flex-col bg-base-200 is-drawer-close:w-14 is-drawer-close:cursor-w-resize is-drawer-open:w-64"
        htmlFor={!isDrawerOpen ? 'sidebar' : ''}
      >
        <div className="relative flex h-12 shrink-0 items-center px-4.5">
          <Link to="/" className="flex items-center gap-2">
            <BowlerLogoIcon className="size-5 shrink-0" />
            <span className="font-extrabold is-drawer-close:hidden">George</span>
          </Link>

          <label
            htmlFor="sidebar"
            aria-label={sidebarToggleTooltip}
            className="tooltip btn absolute tooltip-bottom top-1/2 right-0 z-10 btn-square -translate-y-1/2 rounded-lg bg-base-200 btn-ghost is-drawer-close:invisible is-drawer-close:tooltip-right is-drawer-close:right-2 is-drawer-close:group-hover/sidebar:visible is-drawer-open:pointer-events-auto is-drawer-open:hover:cursor-w-resize"
            data-tip={sidebarToggleTooltip}
          >
            <SidebarToggleIcon className="size-5" />
          </label>
        </div>

        <ul className="flex flex-col is-drawer-open:pointer-events-auto">
          <li className="pointer-events-none">
            <div className="divider my-0 px-2" />
          </li>

          <ListSidebarCollapsibleMenu
            icon={<LibraryIcon className="size-4 shrink-0" />}
            label={t('sidebar.libraries')}
            items={aiLibraries}
            isDrawerOpen={isDrawerOpen}
            to="/libraries"
            groupName="libraries"
            newItemDialogRef={newLibraryDialogRef}
            renderItemLink={(lib) => (
              <div className="flex flex-row items-center rounded-lg py-0 pl-3 has-[a[data-status='active']]:bg-accent/40">
                <Link
                  to="/libraries/$libraryId"
                  params={{ libraryId: lib.id }}
                  className="block h-8 grow content-center"
                >
                  {lib.name}
                </Link>
                <div className="is-drawer-close:hidden">
                  <ItemActionsDropdown item={lib} groupName="libraries" />
                </div>
              </div>
            )}
          />

          <ListSidebarCollapsibleMenu
            icon={<ListViewIcon className="size-4 shrink-0" />}
            label={t('sidebar.lists')}
            items={aiLists}
            isDrawerOpen={isDrawerOpen}
            to="/lists"
            groupName="lists"
            newItemDialogRef={newListDialogRef}
            renderItemLink={(list) => (
              <div className="flex flex-row items-center rounded-lg py-0 pl-3 has-[a[data-status='active']]:bg-accent/40">
                <Link to="/lists/$listId" params={{ listId: list.id }} className="block h-8 grow content-center">
                  {list.name}
                </Link>
                <div className="is-drawer-close:hidden">
                  <ItemActionsDropdown item={list} groupName="lists" />
                </div>
              </div>
            )}
          />

          <ListSidebarCollapsibleMenu
            icon={<LinkIcon className="size-4 shrink-0" />}
            label={t('sidebar.automations')}
            items={automations}
            isDrawerOpen={isDrawerOpen}
            to="/automations"
            groupName="automations"
            newItemDialogRef={newAutomationDialogRef}
            renderItemLink={(automation) => (
              <div className="flex flex-row items-center rounded-lg py-0 pl-3 has-[a[data-status='active']]:bg-accent/40">
                <Link
                  to="/automations/$automationId"
                  params={{ automationId: automation.id }}
                  className="block h-8 grow content-center"
                >
                  {automation.name}
                </Link>
                <div className="is-drawer-close:hidden">
                  <ItemActionsDropdown item={automation} groupName="automations" />
                </div>
              </div>
            )}
          />

          <li>
            <SidebarNavigationLink
              to="/conversations"
              icon={<ConversationIcon className="inline-block size-4 shrink-0" />}
              label={t('sidebar.conversations')}
            />
          </li>
          <li>
            <SidebarNavigationLink
              to="/assistants"
              icon={<UserIcon className="inline-block size-4 shrink-0" />}
              label={t('sidebar.assistants')}
            />
          </li>

          <li className="pointer-events-none">
            <div className="divider my-0 px-2" />
          </li>
          <li>
            <button
              type="button"
              onClick={() => membersDialogRef.current?.showModal()}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 pl-5 hover:animate-pulse is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={t('workspace.members.title')}
              aria-label={t('workspace.members.title')}
            >
              <UsersIcon className="size-4 shrink-0" />
              <span className="text-sm whitespace-nowrap is-drawer-close:hidden">{t('workspace.members.title')}</span>
            </button>
          </li>
        </ul>
      </label>

      {workspaceId && <WorkspaceMembersDialog user={user} ref={membersDialogRef} />}
    </div>
  )
}
