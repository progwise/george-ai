import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

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
  const { workspaces, currentWorkspace, setWorkspace, isLoading, isDefaultWorkspace, currentUserRole, reValidate } =
    useWorkspace(user)
  const createDialogRef = useRef<HTMLDialogElement>(null)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)
  const membersDialogRef = useRef<HTMLDialogElement>(null)
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const handleWorkspaceChange = async (workspaceId: string) => {
    // Close the dropdown first
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

  const handleWorkspaceCreated = async (workspaceId: string) => {
    // Switch to the newly created workspace
    await handleWorkspaceChange(workspaceId)
  }

  // Show loading skeleton while fetching workspaces
  if (isLoading) {
    return <div className="skeleton h-9 w-32" />
  }

  // Hide if no workspaces available
  if (workspaces.length === 0) {
    return null
  }

  const handleDeleteWorkspaceClick = () => {
    reValidate()
    deleteDialogRef.current?.showModal()
  }

  return (
    <>
      <ul className="menu menu-horizontal items-center gap-2">
        <li>
          <details ref={detailsRef}>
            <summary
              role="button"
              className="btn btn-ghost btn-sm max-w-52 gap-1 p-2 text-sm font-normal normal-case"
              aria-label={t('workspace.switcherLabel')}
            >
              <div className="truncate">{currentWorkspace?.name ?? t('workspace.selectWorkspace')}</div>
            </summary>
            <ul className="right-0 max-h-96 overflow-y-auto p-2">
              {workspaces.map((workspace: { id: string; name: string; isDefault: boolean }) => (
                <li key={workspace.id}>
                  <button
                    type="button"
                    onClick={() => handleWorkspaceChange(workspace.id)}
                    className={twMerge(
                      'flex items-center justify-between gap-2 p-2',
                      currentWorkspace?.id === workspace.id && 'menu-active',
                    )}
                  >
                    {workspace.name}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </li>
        <li>
          <button
            type="button"
            onClick={() => membersDialogRef.current?.showModal()}
            className="btn btn-xs btn-square btn-ghost tooltip tooltip-bottom"
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
            className="btn btn-xs btn-square btn-ghost tooltip tooltip-bottom"
            data-tip={t('workspace.createLong')}
            aria-label={t('workspace.create')}
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
              className="btn btn-xs btn-square btn-ghost tooltip tooltip-bottom text-error hover:bg-error hover:text-error-content"
              data-tip={t('workspace.delete')}
              aria-label={t('workspace.delete')}
            >
              <TrashIcon className="size-5" />
            </button>
          </li>
        )}
      </ul>

      <CreateWorkspaceDialog dialogRef={createDialogRef} onWorkspaceCreated={handleWorkspaceCreated} />

      {/* Delete workspace dialog - only rendered when workspace can be deleted */}
      {currentUserRole === 'owner' && !isDefaultWorkspace && (
        <DeleteWorkspaceDialog user={user} ref={deleteDialogRef} />
      )}

      {/* Workspace members dialog */}
      {currentWorkspace && <WorkspaceMembersDialog user={user} ref={membersDialogRef} />}
    </>
  )
}
