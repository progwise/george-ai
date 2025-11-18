import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useWorkspace } from '../hooks/use-workspace'
import { useTranslation } from '../i18n/use-translation-hook'
import { ChevronDownIcon } from '../icons/chevron-down-icon'
import { PlusIcon } from '../icons/plus-icon'
import { CreateWorkspaceDialog } from './workspace/create-workspace-dialog'

export const WorkspaceSwitcher = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { workspaces, currentWorkspace, setWorkspace, isLoading } = useWorkspace()
  const createDialogRef = useRef<HTMLDialogElement>(null)

  const handleWorkspaceChange = async (workspaceId: string) => {
    // Check if workspace is changing before state updates
    const isChangingWorkspace = currentWorkspace?.id !== workspaceId

    // Always set the workspace cookie to ensure it's synchronized
    await setWorkspace(workspaceId)

    // If workspace hasn't changed, just close dropdown without navigation/invalidation
    if (!isChangingWorkspace) {
      const activeElement = document.activeElement as HTMLElement
      activeElement?.blur()
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
        const key = query.queryKey[0] as string
        // Don't invalidate localStorage state (selectedWorkspaceId) or workspaces list
        return key !== 'selectedWorkspaceId' && key !== 'workspaces'
      },
    })
    // Close the dropdown
    const activeElement = document.activeElement as HTMLElement
    activeElement?.blur()
  }

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

  return (
    <>
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          aria-label={t('workspace.switcherLabel')}
          className="btn btn-ghost btn-sm gap-1 text-sm font-normal normal-case"
        >
          <span className="max-w-32 truncate">{currentWorkspace?.name ?? t('workspace.selectWorkspace')}</span>
          <ChevronDownIcon className="size-4" />
        </div>
        <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-10 mt-2 w-52 p-2 shadow-lg">
          {workspaces.map((workspace: { id: string; name: string }) => (
            <li key={workspace.id}>
              <button
                type="button"
                onClick={() => handleWorkspaceChange(workspace.id)}
                className={twMerge(
                  'w-full text-left',
                  currentWorkspace?.id === workspace.id && 'bg-base-300 font-semibold',
                )}
              >
                {workspace.name}
              </button>
            </li>
          ))}
          <li className="border-base-300 mt-2 border-t pt-2">
            <button type="button" onClick={() => createDialogRef.current?.showModal()} className="gap-2">
              <PlusIcon className="size-4" />
              {t('workspace.create')}
            </button>
          </li>
        </ul>
      </div>

      <CreateWorkspaceDialog dialogRef={createDialogRef} onWorkspaceCreated={handleWorkspaceCreated} />
    </>
  )
}
