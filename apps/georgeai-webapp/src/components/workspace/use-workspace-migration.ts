import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { useMemo } from 'react'

import { toastError, toastSuccess } from '../georgeToaster'
import { getWorkspaceVectorStoreQueryOptions } from './queries'
import {
  getWorkspaceLegacyFilesQueryOptions,
  getWorkspaceLibrariesQueryOptions,
  getWorkspaceQueryOptions,
} from './queries'
import { migrateLibraryFn, migrateWorkspaceFn } from './server-functions'

export const useWorkspaceMigration = () => {
  const { user } = useRouteContext({ from: '/_authenticated' })
  const queryClient = useQueryClient()

  const workspaceId = user.selectedWorkspaceId

  const { data: workspace, isLoading: workspaceIsLoading } = useQuery(getWorkspaceQueryOptions({ workspaceId }))

  const { data: vectorStore, isLoading: vectorStoreIsLoading } = useQuery(
    getWorkspaceVectorStoreQueryOptions({ workspaceId }),
  )

  const { data: libraries, isLoading: librariesIsLoading } = useQuery(
    getWorkspaceLibrariesQueryOptions({ workspaceId }),
  )

  const { data: legacyFiles, isLoading: legacyFilesIsLoading } = useQuery(
    getWorkspaceLegacyFilesQueryOptions({ workspaceId }),
  )

  const invalidateStatus = async () => {
    await Promise.all([
      queryClient.invalidateQueries(getWorkspaceQueryOptions({ workspaceId })),
      queryClient.invalidateQueries(getWorkspaceVectorStoreQueryOptions({ workspaceId })),
      queryClient.invalidateQueries(getWorkspaceLibrariesQueryOptions({ workspaceId })),
      queryClient.invalidateQueries(getWorkspaceLegacyFilesQueryOptions({ workspaceId })),
    ])
  }

  const migrateWorkspaceMutation = useMutation({
    mutationFn: async (data: { workspaceId: string }) => {
      return await migrateWorkspaceFn({ data })
    },
    onSuccess: (data) => {
      toastSuccess(`Workspace migrated successfully to Version ${data.version}.`)
    },
    onError: (error) => {
      toastError(error.message)
    },
  })

  const migrateLibraryMutation = useMutation({
    mutationFn: async (data: { workspaceId: string; libraryId: string }) => {
      return await migrateLibraryFn({ data })
    },
  })

  const workspaceStatus = useMemo(() => {
    if (workspaceIsLoading || !workspace) {
      return {
        workspaceId,
        type: 'workspace' as const,
        label: '?',
        isLoading: workspaceIsLoading,

        status: 'loading' as const,
      }
    }
    const vectorStoreVersion = vectorStore && vectorStore.version ? vectorStore.version : '?'

    return {
      id: workspace.id,
      type: 'workspace' as const,
      label: workspace.name,
      isLoading: vectorStoreIsLoading,
      status: !workspace.manifest
        ? ('Manifest missing' as const)
        : vectorStoreVersion !== 1
          ? (`Vector Store ${vectorStoreVersion}` as const)
          : ('ok' as const),
    }
  }, [workspace, workspaceId, workspaceIsLoading, vectorStoreIsLoading, vectorStore])

  const librariesStatus = useMemo(() => {
    if (!libraries) {
      return []
    }

    return libraries.map((library) => {
      const legacyFilesForLibrary = legacyFiles?.find((lf) => lf.libraryId === library.id)
      const status = !library.manifest
        ? ('Manifest missing' as const)
        : library.manifest.version !== 1
          ? ('outdated' as const)
          : legacyFilesForLibrary && legacyFilesForLibrary.files && legacyFilesForLibrary.files.length > 0
            ? (`${legacyFilesForLibrary.files.length} Legacy files` as const)
            : ('ok' as const)

      return {
        id: library.id,
        type: 'library' as const,
        label: library.name,
        isLoading: legacyFilesIsLoading,
        status,
      }
    })
  }, [libraries, legacyFiles, legacyFilesIsLoading])

  return {
    invalidateStatus,
    workspace,
    workspaceStatus,
    workspaceStatusIsLoading: workspaceIsLoading,
    librariesStatus,
    librariesIsLoading,
    migrateWorkspace: migrateWorkspaceMutation.mutate,
    migrateLibrary: migrateLibraryMutation.mutate,
    isMigrating: migrateWorkspaceMutation.isPending || migrateLibraryMutation.isPending,
  }
}
