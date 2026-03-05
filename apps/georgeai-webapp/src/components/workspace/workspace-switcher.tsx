import { useEffect, useRef } from 'react'

import { CurrentUserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { useWorkspace } from './use-workspace'

export const WorkspaceSwitcher = ({ user }: { user: CurrentUserFragment }) => {
  const { t } = useTranslation()
  const { workspaces, currentWorkspace, setWorkspace, isLoading } = useWorkspace(user)
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
  if (workspaces?.totalCount === 0) {
    return null
  }

  // TODO: Needs paging of workspaces
  return (
    <>
      <div className="menu menu-horizontal items-center gap-2">
        <li>
          <details ref={detailsRef} aria-label={t('workspace.selectWorkspace')}>
            <summary className="btn max-w-120 gap-1.5 truncate rounded-lg p-2 text-base font-normal normal-case btn-ghost btn-sm">
              {t('workspace.current')}
              {currentWorkspace?.name ?? t('workspace.noWorkspaceSelected')}
            </summary>
            <ul role="listbox" className="top-5.5 left-0 z-40 max-h-96 overflow-y-auto rounded-lg bg-base-200 p-2">
              {workspaces?.items.map((workspace: { id: string; name: string; isDefault: boolean }) => (
                <li
                  key={workspace.id}
                  className="cursor-pointer rounded-lg"
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
      </div>
    </>
  )
}
