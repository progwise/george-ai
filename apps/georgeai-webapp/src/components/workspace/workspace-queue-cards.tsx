import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { WorkspaceRole } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'

interface WorkspaceQueueCardsProps {
  currentWorkspaceRole?: WorkspaceRole
}
export const WorkspaceQueueCards = ({ currentWorkspaceRole }: WorkspaceQueueCardsProps) => {
  const { t } = useTranslation()

  //const { data: queueSystemStatus, isLoading, error } = useQuery(getQueueStatusQueryOptions())

  const isLoading = false
  const error = null
  const queueSystemStatus = {
    queues: [
      {
        queueType: 'INFERENCE',
        pendingTasks: 5,
        processingTasks: 2,
        failedTasks: 1,
        isRunning: true,
      },
      {
        queueType: 'EMBEDDING',
        pendingTasks: 3,
        processingTasks: 1,
        failedTasks: 0,
        isRunning: false,
      },
    ],
  }

  if (!currentWorkspaceRole || isLoading) {
    return (
      <div className="stats min-w-50 flex-1 shadow-sm">
        <div className="stat py-3">
          <div className="h-4 w-24 skeleton" />
          <div className="mt-2 h-8 w-16 skeleton" />
          <div className="mt-2 h-3 w-32 skeleton" />
        </div>
      </div>
    )
  }

  if (error || !queueSystemStatus) {
    return (
      <div className="stats min-w-50 flex-1 shadow-sm">
        <div className="stat py-3">
          <div className="stat-title text-sm">Error loading queue status</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {queueSystemStatus.queues.map((queue) => {
        const queueCard = (
          <div className="stat py-3">
            <div className="stat-title text-sm">{queue.queueType.replace('_', ' ')}</div>
            <div className="stat-value text-2xl">{queue.pendingTasks}</div>
            <div className={`stat-desc text-xs ${queue.isRunning ? 'text-success' : 'text-error'}`}>
              {queue.isRunning ? '✓' : '✗'} {queue.processingTasks} {t('dashboard.labels.processing')},{' '}
              {queue.failedTasks} {t('dashboard.labels.failed')}
            </div>
          </div>
        )

        if (currentWorkspaceRole === 'admin' || currentWorkspaceRole === 'owner') {
          return (
            <Link
              key={queue.queueType}
              to="/admin/workers"
              className="stats min-w-50 flex-1 shadow-sm transition-shadow hover:shadow-lg"
            >
              {queueCard}
            </Link>
          )
        }

        return (
          <div key={queue.queueType} className="stats min-w-50 flex-1 shadow-sm">
            {queueCard}
          </div>
        )
      })}
    </>
  )
}
