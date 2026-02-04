import { UserFragment } from '../../gql/graphql'
import { useWorkspace } from './use-workspace'

interface WorkspaceStatusCardProps {
  user: UserFragment
}

export function WorkspaceStatusCard({ user }: WorkspaceStatusCardProps) {
  const { upgradeWorkspace, workspaceStats: stats, isPending, currentWorkspace } = useWorkspace(user)
  if (!stats) {
    return null // TODO: Skeleton loader
  }

  const handleUpgrade = () => {
    if (!currentWorkspace) return
    upgradeWorkspace(currentWorkspace.id, {
      onSuccess: () => {
        window.location.reload()
      },
      onError: (error: Error) => {
        alert(`Error upgrading workspace: ${error.message}`)
      },
    })
  }

  const isLegacy = !stats.workspaceInfo

  return (
    <div className="stats min-w-50 flex-1 shadow-sm">
      <div className="stat py-3">
        <div className="stat-title text-sm">{`Version ${stats.workspaceInfo ? stats.workspaceInfo.version : 'legacy'}`}</div>
        <div className="stat-value text-2xl">{`${stats.name} `}</div>
        <div className="stat-desc text-xs text-error">
          {isLegacy ? (
            user.isAdmin ? (
              <button disabled={isPending} type="button" className="link link-hover" onClick={() => handleUpgrade()}>
                Migrate
              </button>
            ) : (
              <div className="badge">Please contact your workspace administrator.</div>
            )
          ) : (
            'Up to date'
          )}
        </div>
      </div>
    </div>
  )
}
