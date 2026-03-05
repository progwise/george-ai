import { useSuspenseQuery } from '@tanstack/react-query'
import { useRef } from 'react'

import 'tailwind-merge'

import { CurrentUserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ConversationIcon } from '../../icons/conversation-icon'
import { FolderPlusIcon } from '../../icons/folder-plus'
import { LibraryIcon } from '../../icons/library-icon'
import { LinkIcon } from '../../icons/link-icon'
import { ListViewIcon } from '../../icons/list-view-icon'
import { TrashIcon } from '../../icons/trash-icon'
import UserIcon from '../../icons/user-icon'
import { UsersIcon } from '../../icons/users-icon'
import { getAutomationsQueryOptions } from '../automations/queries'
import { getLibrariesQueryOptions } from '../library/queries/get-libraries'
import { getListsQueryOptions } from '../lists/queries'
import { WorkspaceMembersDialog } from '../workspace/members/workspace-members-dialog'
import { useWorkspace } from '../workspace/use-workspace'
import { SidebarDivider } from './sidebar-divider'
import { SidebarHeader } from './sidebar-header'
import { SidebarNavGroup } from './sidebar-nav-group'
import { SidebarNavigationLink } from './sidebar-navigation-link'

interface SidebarProps {
  user: CurrentUserFragment
  workspaceId: string | null | undefined
  isDrawerOpen: boolean
  newLibraryDialogRef: React.RefObject<HTMLDialogElement | null>
  newListDialogRef: React.RefObject<HTMLDialogElement | null>
  newAutomationDialogRef: React.RefObject<HTMLDialogElement | null>
  createWorkspaceDialogRef: React.RefObject<HTMLDialogElement | null>
  deleteWorkspaceDialogRef: React.RefObject<HTMLDialogElement | null>
}

export function Sidebar({
  user,
  workspaceId,
  isDrawerOpen,
  newLibraryDialogRef,
  newListDialogRef,
  newAutomationDialogRef,
  createWorkspaceDialogRef,
  deleteWorkspaceDialogRef,
}: SidebarProps) {
  const { t } = useTranslation()
  const membersDialogRef = useRef<HTMLDialogElement>(null)
  const { validate, isDefaultWorkspace, currentUserRole } = useWorkspace(user)

  const {
    data: { items: libraries, totalCount: librariesCount },
  } = useSuspenseQuery(getLibrariesQueryOptions())
  const {
    data: { aiLists },
  } = useSuspenseQuery(getListsQueryOptions())
  const {
    data: { automations },
  } = useSuspenseQuery(getAutomationsQueryOptions())

  const menuItems = [
    {
      icon: <LibraryIcon className="shrink-0" />,
      label: t('sidebar.libraries'),
      items: libraries,
      to: '/libraries',
      groupName: 'libraries',
      dialogRef: newLibraryDialogRef,
      getLink: (item: { id: string; name: string }) => ({
        to: '/libraries/$libraryId',
        params: { libraryId: item.id },
      }),
      count: librariesCount,
    },
    {
      icon: <ListViewIcon className="shrink-0" />,
      label: t('sidebar.lists'),
      items: aiLists,
      to: '/lists',
      groupName: 'lists',
      dialogRef: newListDialogRef,
      getLink: (item: { id: string; name: string }) => ({ to: '/lists/$listId', params: { listId: item.id } }),
      count: 0, // TODO
    },
    {
      icon: <LinkIcon className="shrink-0" />,
      label: t('sidebar.automations'),
      items: automations,
      to: '/automations',
      groupName: 'automations',
      dialogRef: newAutomationDialogRef,
      getLink: (item: { id: string; name: string }) => ({
        to: '/automations/$automationId',
        params: { automationId: item.id },
      }),
      count: 0,
    },
  ] as const

  const activeWorkspaceId = workspaceId ?? user.defaultWorkspaceId

  const handleDeleteWorkspaceClick = async () => {
    await validate()
    deleteWorkspaceDialogRef.current?.showModal()
  }

  return (
    <div
      role="complementary"
      aria-label={t('sidebar.ariaLabel')}
      className="group/sidebar drawer-side z-60 transition-all duration-200 ease-in is-drawer-close:overflow-visible"
    >
      <label htmlFor="sidebar" aria-label={t('sidebar.toggleDescription')} className="drawer-overlay" />
      <label
        className="fixed top-0 left-0 flex min-h-full flex-col bg-base-200 is-drawer-close:w-14 is-drawer-close:cursor-w-resize is-drawer-open:w-64"
        htmlFor={!isDrawerOpen ? 'sidebar' : ''}
      >
        <SidebarHeader isDrawerOpen={isDrawerOpen} />

        <ul className="flex flex-col is-drawer-open:pointer-events-auto">
          <SidebarDivider />

          {menuItems.map(({ icon, label, items, to, groupName, dialogRef: newItemDialogRef, getLink, count }) => (
            <SidebarNavGroup
              key={groupName}
              icon={icon}
              label={label}
              items={items}
              isDrawerOpen={isDrawerOpen}
              to={to}
              groupName={groupName}
              newItemDialogRef={newItemDialogRef}
              getLink={getLink}
              count={count}
            />
          ))}
          <li>
            <SidebarNavigationLink
              to="/conversations"
              icon={<ConversationIcon className="inline-block shrink-0" />}
              label={t('sidebar.conversations')}
            />
          </li>
          <li>
            <SidebarNavigationLink
              to="/assistants"
              icon={<UserIcon className="inline-block shrink-0" />}
              label={t('sidebar.assistants')}
            />
          </li>
          <SidebarDivider />

          <li className="px-1">
            <button
              type="button"
              onClick={() => membersDialogRef.current?.showModal()}
              className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg p-2 pl-4 hover:animate-pulse is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={t('workspace.members.title')}
              aria-label={t('workspace.members.title')}
            >
              <UsersIcon className="size-4 shrink-0" />
              <span className="text-sm whitespace-nowrap is-drawer-close:hidden">{t('workspace.members.title')}</span>
            </button>
          </li>
          <li className="px-1">
            <button
              type="button"
              onClick={() => createWorkspaceDialogRef.current?.showModal()}
              className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg p-2 pl-4 hover:animate-pulse is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={t('workspace.createLong')}
              aria-label={t('workspace.createTitle')}
            >
              <FolderPlusIcon className="mx-0 shrink-0" />
              <span className="text-sm whitespace-nowrap is-drawer-close:hidden">{t('workspace.createTitle')}</span>
            </button>
          </li>
          {/* Delete button - only show for owners of non-default workspaces */}
          {currentUserRole === 'owner' && !isDefaultWorkspace && (
            <li className="px-1">
              <button
                type="button"
                onClick={handleDeleteWorkspaceClick}
                className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg p-2 pl-4 text-error hover:bg-error/20 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip={t('workspace.deleteTitle')}
                aria-label={t('workspace.deleteTitle')}
              >
                <TrashIcon className="shrink-0" />
                <span className="text-sm whitespace-nowrap text-error is-drawer-close:hidden">
                  {t('workspace.deleteTitle')}
                </span>
              </button>
            </li>
          )}
        </ul>
      </label>

      {activeWorkspaceId && <WorkspaceMembersDialog user={user} ref={membersDialogRef} />}
    </div>
  )
}
