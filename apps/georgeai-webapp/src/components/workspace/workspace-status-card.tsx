import { formatBytes } from '@george-ai/web-utils'

import { UserFragment } from '../../gql/graphql'
import { useWorkspace } from './use-workspace'

interface WorkspaceStatusCardProps {
  user: UserFragment
}

export function WorkspaceStatusCard({ user }: WorkspaceStatusCardProps) {
  const { workspaceStats: stats } = useWorkspace(user)
  if (!stats) {
    return null // TODO: Skeleton loader
  }

  const isLegacy = !stats.workspaceInfo

  return (
    <div className="stats min-w-50 flex-1 shadow-sm">
      <div className="stat py-3">
        <div className="stat-title text-sm">{`${stats.workspaceInfo ? 'Workspace Version' + stats.workspaceInfo.version : 'Legacy Workspace'}`}</div>
        <div className="stat-value text-2xl">{`${stats.name} `}</div>
        <div className="stat-desc text-xs text-error">
          {isLegacy ? (
            user.isAdmin ? (
              <div className="badge badge-sm badge-warning">Needs migration</div>
            ) : (
              <div className="badge badge-sm badge-info">Please contact your workspace administrator.</div>
            )
          ) : (
            <>
              <div className="badge badge-xs badge-info">{formatBytes(stats.workspaceInfo?.usage.physicalBytes)}</div>
              <div className="badge badge-xs badge-info">{stats.workspaceInfo?.usage.physicalFiles} Files</div>
              <div className="badge badge-xs badge-info">{stats.workspaceInfo?.usage.extractions} Extractions</div>
              <div className="badge badge-xs badge-info">
                {stats.embeddingInfo?.reduce((acc, info) => acc + (info.chunkCount || 0), 0)} Embeddings
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
