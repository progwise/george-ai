import { useRouter } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { useWorkspace } from '../hooks/use-workspace'
import { useTranslation } from '../i18n/use-translation-hook'
import { ChevronDownIcon } from '../icons/chevron-down-icon'

export const WorkspaceSwitcher = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { workspaces, currentWorkspace, setWorkspace, isLoading } = useWorkspace()

  const handleWorkspaceChange = async (workspaceId: string) => {
    setWorkspace(workspaceId)
    // Invalidate and reload to apply workspace context
    await router.invalidate()
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
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-1 text-sm font-normal normal-case">
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
      </ul>
    </div>
  )
}
