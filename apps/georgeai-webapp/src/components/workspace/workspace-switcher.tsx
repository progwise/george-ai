import { useEffect, useRef } from 'react'

import { UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { FolderPlusIcon } from '../../icons/folder-plus'
import { TrashIcon } from '../../icons/trash-icon'
import { UsersIcon } from '../../icons/users-icon'
import { CreateWorkspaceDialog } from './create-workspace-dialog'
import { DeleteWorkspaceDialog } from './delete-workspace-dialog'
import { WorkspaceMembersDialog } from './members/workspace-members-dialog'
import { useWorkspace } from './use-workspace'

export const WorkspaceSwitcher = ({ user }: { user: UserFragment }) => {
  const { t } = useTranslation()
  const { workspaces, currentWorkspace, setWorkspace, validate, isLoading, isDefaultWorkspace, currentUserRole } =
    useWorkspace(user)
  const createDialogRef = useRef<HTMLDialogElement>(null)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)
  const membersDialogRef = useRef<HTMLDialogElement>(null)
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const handleWorkspaceChange = async (workspaceId: string) => {
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
    // setWorkspace handles: early return if same, cookie, navigation, query invalidation
    await setWorkspace(workspaceId)
  }

  useEffect(() => {
    if (!detailsRef.current) return
    const handleMouseDown = (e: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(e.target as Node)) {
        detailsRef.current.open = false
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && detailsRef.current) {
        detailsRef.current.open = false
      }
    }
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isLoading])

  // Show loading skeleton while fetching workspaces
  if (isLoading) {
    return <div className="h-9 w-32 skeleton" />
  }

  // Hide if no workspaces available
  if (workspaces.length === 0) {
    return null
  }

  const handleDeleteWorkspaceClick = async () => {
    await validate()
    deleteDialogRef.current?.showModal()
  }

  return (
    <>
      <ul className="menu menu-horizontal items-center gap-2">
        <li>
          <details ref={detailsRef} aria-label={t('workspace.selectWorkspace')}>
            <summary className="btn max-w-52 gap-1 truncate p-2 text-sm font-normal normal-case btn-ghost btn-sm">
              {currentWorkspace?.name ?? t('workspace.noWorkspaceSelected')}
            </summary>
            <ul role="listbox" className="right-0 max-h-96 overflow-y-auto p-2">
              {workspaces.map((workspace: { id: string; name: string; isDefault: boolean }) => (
                <li
                  key={workspace.id}
                  className="cursor-pointer hover:bg-base-200"
                  role="option"
                  tabIndex={0}
                  aria-selected={currentWorkspace?.id === workspace.id}
                  onClick={() => handleWorkspaceChange(workspace.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      handleWorkspaceChange(workspace.id)
                    }
                  }}
                >
                  <span className="text-nowrap">{workspace.name}</span>
                </li>
              ))}
            </ul>
          </details>
        </li>
        <li>
          <button
            type="button"
            onClick={() => membersDialogRef.current?.showModal()}
            className="tooltip btn tooltip-bottom btn-square btn-ghost btn-xs"
            data-tip={t('workspace.members.title')}
            aria-label={t('workspace.members.title')}
          >
            <UsersIcon className="size-5" />
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => createDialogRef.current?.showModal()}
            className="tooltip btn tooltip-bottom btn-square btn-ghost btn-xs"
            data-tip={t('workspace.createLong')}
            aria-label={t('workspace.createTitle')}
          >
            <FolderPlusIcon className="size-5" />
          </button>
        </li>
        {/* Delete button - only show for owners of non-default workspaces */}
        {currentUserRole === 'owner' && !isDefaultWorkspace && (
          <li>
            <button
              type="button"
              onClick={handleDeleteWorkspaceClick}
              className="tooltip btn tooltip-bottom btn-square text-error btn-ghost btn-xs hover:bg-error hover:text-error-content"
              data-tip={t('workspace.deleteTitle')}
              aria-label={t('workspace.deleteTitle')}
            >
              <TrashIcon className="size-5" />
            </button>
          </li>
        )}
      </ul>

      <CreateWorkspaceDialog user={user} dialogRef={createDialogRef} />

      {/* Delete workspace dialog - only rendered when workspace can be deleted */}
      {currentUserRole === 'owner' && !isDefaultWorkspace && (
        <DeleteWorkspaceDialog user={user} ref={deleteDialogRef} />
      )}

      {/* Workspace members dialog */}
      {currentWorkspace && <WorkspaceMembersDialog user={user} ref={membersDialogRef} />}
    </>
  )
}
