import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { getWorkspacesQueryOptions } from '../components/workspace/queries/get-workspaces'
import { setWorkspaceCookie } from '../server-functions/workspace-cookie'
import { useLocalstorage } from './use-local-storage'

const WORKSPACE_KEY = 'selectedWorkspaceId'

export const useWorkspace = () => {
  const { data: workspaces, isLoading } = useQuery(getWorkspacesQueryOptions())
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useLocalstorage<string>(WORKSPACE_KEY)

  // Get current workspace from selection or fallback to first workspace
  const currentWorkspace = useMemo(() => {
    if (!workspaces) return null

    if (selectedWorkspaceId) {
      const workspace = workspaces.find((w: { id: string }) => w.id === selectedWorkspaceId)
      if (workspace) return workspace
    }
    // Fallback to first workspace
    return workspaces[0] ?? null
  }, [workspaces, selectedWorkspaceId])

  // Set workspace and update cookie
  const setWorkspace = useCallback(
    async (workspaceId: string | null) => {
      await setWorkspaceCookie({ data: { workspaceId } })
      setSelectedWorkspaceId(workspaceId)
    },
    [setSelectedWorkspaceId],
  )

  return {
    workspaces: workspaces ?? [],
    currentWorkspace,
    currentWorkspaceId: currentWorkspace?.id || null,
    setWorkspace,
    isLoading,
  }
}
