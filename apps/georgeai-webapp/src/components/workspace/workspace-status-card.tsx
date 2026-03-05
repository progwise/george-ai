import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { formatBytes } from '@george-ai/web-utils'

import { CurrentUserFragment, Workspace } from '../../gql/graphql'
import { MigrateWorkspaceDialog } from './migrate-workspace-dialog'

interface WorkspaceStatusCardProps {
  user: CurrentUserFragment
  currentWorkspace: Workspace | undefined
}

export function WorkspaceStatusCard({ user, currentWorkspace }: WorkspaceStatusCardProps) {
  const [showMigrationDialog, setShowMigrationDialog] = useState(false)
  if (!currentWorkspace) {
    return (
      <div className="stats min-w-50 flex-1 shadow-sm">
        <div className="stat py-3">
          <div className="h-4 w-36 skeleton" />
          <div className="mt-2 h-8 w-48 skeleton" />
          <div className="mt-2 flex gap-2">
            <div className="h-4 w-16 skeleton rounded-sm" />
            <div className="h-4 w-16 skeleton rounded-sm" />
            <div className="h-4 w-20 skeleton rounded-sm" />
            <div className="h-4 w-28 skeleton rounded-sm" />
          </div>
        </div>
      </div>
    )
  }

  const workspaceVersion = currentWorkspace.manifest?.version
  const isLegacy = currentWorkspace.manifest?.version !== 1
  const isAdmin = currentWorkspace.role === 'admin' || currentWorkspace.role === 'owner'

  const workspaceCard = (
    <div className="stat py-3">
      <div className="stat-title text-sm">{!isLegacy ? `Workspace (V ${workspaceVersion})` : 'Legacy Workspace'}</div>
      <div className="stat-value text-2xl">{`${currentWorkspace.name} `}</div>
      <div className={twMerge('stat-desc text-xs', !isLegacy ? 'text-success' : 'text-error')}>
        {!isLegacy ? (
          <div className="flex gap-1">
            <span>{formatBytes(currentWorkspace.manifest?.storageStats.physicalBytes)}</span>
            <span>, {currentWorkspace.manifest?.storageStats.physicalFileCount} Files</span>
            <span>, {currentWorkspace.manifest?.storageStats.extractionFileCount} Extraction files</span>
            <span>, {currentWorkspace.chunksCount} Chunks</span>
          </div>
        ) : isAdmin ? (
          <span>Needs migration</span>
        ) : (
          <span>Please contact your workspace administrator.</span>
        )}
      </div>
    </div>
  )

  if (isAdmin) {
    return (
      <>
        <div
          onClick={() => {
            setShowMigrationDialog(true)
          }}
          role="button"
          className="stats min-w-50 flex-1 shadow-sm transition-shadow hover:cursor-pointer hover:shadow-lg"
        >
          {workspaceCard}
        </div>
        {showMigrationDialog && <MigrateWorkspaceDialog user={user} onClose={() => setShowMigrationDialog(false)} />}
      </>
    )
  }

  return <div className="stats min-w-50 flex-1 shadow-sm">{workspaceCard}</div>
}
