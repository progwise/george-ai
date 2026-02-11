import { formatBytes } from '@george-ai/web-utils'

import { UserFragment } from '../../gql/graphql'
import { useWorkspace } from './use-workspace'

interface WorkspaceStatusCardProps {
  user: UserFragment
}

export function WorkspaceStatusCard({ user }: WorkspaceStatusCardProps) {
  const { currentWorkspace } = useWorkspace(user)
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

  return (
    <div className="stats min-w-50 flex-1 shadow-sm">
      <div className="stat py-3">
        <div className="stat-title text-sm">
          {!isLegacy ? `Workspace Version ${workspaceVersion}` : 'Legacy Workspace'}
        </div>
        <div className="stat-value text-2xl">{`${currentWorkspace.name} `}</div>
        <div className="stat-desc text-xs text-error">
          {isLegacy ? (
            currentWorkspace.role === 'admin' || currentWorkspace.role === 'owner' ? (
              <div className="badge badge-sm badge-warning">Needs migration</div>
            ) : (
              <div className="badge badge-sm badge-info">Please contact your workspace administrator.</div>
            )
          ) : (
            <>
              <div className="badge badge-xs badge-info">
                {formatBytes(currentWorkspace.manifest?.usage.physicalBytes)}
              </div>
              <div className="badge badge-xs badge-info">{currentWorkspace.manifest?.usage.physicalFiles} Files</div>
              <div className="badge badge-xs badge-info">
                {currentWorkspace.manifest?.usage.extractions} Extractions
              </div>
              <div className="badge badge-xs badge-info">{currentWorkspace.chunksCount} Chunks for embeddings</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
