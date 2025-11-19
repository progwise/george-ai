import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useWorkspace } from '../hooks/use-workspace'
import { useTranslation } from '../i18n/use-translation-hook'
import { FolderPlusIcon } from '../icons/folder-plus'
import { TrashIcon } from '../icons/trash-icon'
import { CreateWorkspaceDialog } from './workspace/create-workspace-dialog'
import { DeleteWorkspaceDialog } from './workspace/delete-workspace-dialog'

export const WorkspaceSwitcher = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { workspaces, currentWorkspace, setWorkspace, isLoading } = useWorkspace()
  const createDialogRef = useRef<HTMLDialogElement>(null)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null)

  const handleWorkspaceChange = async (workspaceId: string) => {
    // Check if workspace is changing before state updates
    const isChangingWorkspace = currentWorkspace?.id !== workspaceId

    // Always set the workspace cookie to ensure it's synchronized
    await setWorkspace(workspaceId)

    // If workspace hasn't changed, just close dropdown without navigation/invalidation
    if (!isChangingWorkspace) {
      if (detailsRef.current) {
        detailsRef.current.open = false
      }
      return
    }

    // If currently viewing a workspace-scoped resource, navigate to list view
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/libraries/')) {
      navigate({ to: '/libraries' })
    } else if (currentPath.startsWith('/assistants/')) {
      navigate({ to: '/assistants' })
    } else if (currentPath.startsWith('/lists/')) {
      navigate({ to: '/lists' })
    }

    // Invalidate workspace-scoped data queries, but NOT localStorage state or workspaces list
    await queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0]
        // Don't invalidate localStorage state (selectedWorkspaceId) or workspaces list
        return typeof key === 'string' && key !== 'selectedWorkspaceId' && key !== 'workspaces'
      },
    })
    // Close the dropdown
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
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
  }, [])

  const handleWorkspaceCreated = async (workspaceId: string) => {
    // Switch to the newly created workspace
    await handleWorkspaceChange(workspaceId)
  }

  const handleWorkspaceDeleted = async () => {
    // Invalidate workspaces query to refresh the list
    await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    setWorkspaceToDelete(null)
  }

  const handleDeleteClick = (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation()
    setWorkspaceToDelete(workspaceId)
  }

  useEffect(() => {
    // Reset workspace to delete when dialog is closed
    if (!deleteDialogRef.current) return
    if (workspaceToDelete) {
      deleteDialogRef.current.showModal()
    } else {
      deleteDialogRef.current.close()
    }
  }, [workspaceToDelete])

  // Show loading skeleton while fetching workspaces
  if (isLoading) {
    return <div className="skeleton h-9 w-32" />
  }

  // Hide if no workspaces available
  if (workspaces.length === 0) {
    return null
  }

  return (
    <>
      <ul className="menu menu-horizontal items-center gap-2">
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
                <li key={workspace.id} className="">
                  <div
                    className={twMerge(
                      'flex items-center justify-between gap-2 p-2',
                      currentWorkspace?.id === workspace.id && 'menu-active',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleWorkspaceChange(workspace.id)}
                      className="flex-1 text-left"
                    >
                      {workspace.name}
                    </button>
                    {!workspace.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, workspace.id)}
                        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error hover:text-error-content"
                        aria-label={t('workspace.delete')}
                        title={t('workspace.delete')}
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </li>
      </ul>

      <CreateWorkspaceDialog dialogRef={createDialogRef} onWorkspaceCreated={handleWorkspaceCreated} />

      {/* Single delete dialog for all workspaces */}
      {workspaceToDelete && (
        <DeleteWorkspaceDialog
          ref={deleteDialogRef}
          workspaceId={workspaceToDelete}
          workspaceName={workspaces.find((w) => w.id === workspaceToDelete)?.name ?? ''}
          onWorkspaceDeleted={handleWorkspaceDeleted}
        />
      )}
    </>
  )
}
