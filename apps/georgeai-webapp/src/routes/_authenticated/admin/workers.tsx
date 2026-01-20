import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getWorkspaceWorkerStatistcsQueryOptions } from '../../../components/admin/queries/get-worker-stats'
import { getWorkspaceWorkersQueryOptions } from '../../../components/admin/queries/get-workers'
import { ManageWorkersMenu } from '../../../components/admin/workers/manage-workers-menu'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { CheckIcon } from '../../../icons/check-icon'
import { CpuIcon } from '../../../icons/cpu-icon'
import { ProcessingIcon } from '../../../icons/processing-icon'
import { ServerIcon } from '../../../icons/server-icon'
import { ShieldCheckIcon } from '../../../icons/shield-check-icon'

export const Route = createFileRoute('/_authenticated/admin/workers')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getWorkspaceWorkersQueryOptions()),
      context.queryClient.ensureQueryData(getWorkspaceWorkerStatistcsQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const { t } = useTranslation()

  // Use suspense query - data is guaranteed to be available
  const { data: workers } = useSuspenseQuery({
    ...getWorkspaceWorkersQueryOptions(),
    refetchInterval: 5000, // Override refetch interval for auto-refresh
  })

  const { data: workerStatistics } = useSuspenseQuery({
    ...getWorkspaceWorkerStatistcsQueryOptions(),
    refetchInterval: 5000, // Override refetch interval for auto-refresh
  })

  // Calculate overview statistics
  const totalWorkers = workers.length
  const totalSubscriptions = workers.reduce((sum, worker) => sum + worker.activeSubscriptions.length, 0)

  // Helper to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSeconds < 60) return `${diffSeconds}s ago`
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`
    return `${Math.floor(diffSeconds / 86400)}d ago`
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-linear-to-br from-accent/20 to-accent/10 p-3 shadow-lg">
            <ProcessingIcon className="size-8 text-accent" />
          </div>
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{t('admin.workers.title')}</h1>
            <p className="text-base-content/60">{t('admin.manageWorkersDescription')}</p>
          </div>
        </div>
        <div>
          <ManageWorkersMenu />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="stats shadow-sm">
          <div className="stat">
            <div className="stat-figure text-primary">
              <ProcessingIcon className="size-8" />
            </div>
            <div className="stat-title">{t('admin.workers.activeWorkers')}</div>
            <div className="stat-value text-primary">{totalWorkers}</div>
            <div className="stat-desc">
              {workers.filter((w) => w.healthy).length} {t('admin.workers.healthy')}
            </div>
          </div>
        </div>

        <div className="stats shadow-sm">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <CpuIcon className="size-8" />
            </div>
            <div className="stat-title">{t('admin.workers.activeSubscriptions')}</div>
            <div className="stat-value text-secondary">{totalSubscriptions}</div>
            <div className="stat-desc">{t('admin.workers.processingType')}</div>
          </div>
        </div>
      </div>

      {/* Active Workers Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            <ServerIcon className="size-6" />
            {t('admin.workers.activeWorkers')}
          </h2>

          {workers.length === 0 ? (
            <div className="py-8 text-center text-base-content/60">{t('admin.workers.noActiveWorkers')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('admin.workers.workerId')}</th>
                    <th>{t('admin.workers.lastHeartbeat')}</th>
                    <th>{t('admin.workers.activeSubscriptions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker.workerId}>
                      <td>
                        <div className="flex items-center gap-2">
                          {worker.healthy ? (
                            <ShieldCheckIcon className="size-5 text-success" />
                          ) : (
                            <div className="badge badge-sm badge-error">{t('admin.workers.offline')}</div>
                          )}
                          <code className="text-sm">{worker.workerId}</code>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div>{formatTimeAgo(worker.lastHeartbeatAt)}</div>
                          <div className="text-xs text-base-content/60">
                            {new Date(worker.lastHeartbeatAt).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          {worker.activeSubscriptions.length === 0 ? (
                            <div className="text-sm text-base-content/60">-</div>
                          ) : (
                            worker.activeSubscriptions.map((sub) => (
                              <div key={`${sub.workspaceId}-${sub.processingType}`} className="flex items-center gap-2">
                                <div className="badge badge-sm badge-primary">{sub.processingType}</div>
                                <code className="text-xs">{sub.workspaceId.slice(0, 8)}...</code>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Workspace Statistics */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            <CheckIcon className="size-6" />
            {t('admin.workers.workspaceStatistics')}
          </h2>

          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>{t('admin.workers.workspaceId')}</th>
                  <th colSpan={3} className="text-center">
                    {t('admin.workers.embeddingRequests')}
                  </th>
                  <th colSpan={3} className="text-center">
                    {t('admin.workers.embeddingProgress')}
                  </th>
                  <th colSpan={3} className="text-center">
                    {t('admin.workers.embeddingFinished')}
                  </th>
                </tr>
                <tr>
                  <th></th>
                  <th className="text-xs">{t('admin.workers.total')}</th>
                  <th className="text-xs">{t('admin.workers.processed')}</th>
                  <th className="text-xs">{t('admin.workers.pending')}</th>
                  <th className="text-xs">{t('admin.workers.total')}</th>
                  <th className="text-xs">{t('admin.workers.processed')}</th>
                  <th className="text-xs">{t('admin.workers.pending')}</th>
                  <th className="text-xs">{t('admin.workers.total')}</th>
                  <th className="text-xs">{t('admin.workers.processed')}</th>
                  <th className="text-xs">{t('admin.workers.pending')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code className="text-xs">{workerStatistics.workspaceId.slice(0, 8)}...</code>
                  </td>
                  {/* Embedding Requests */}
                  <td className="text-center">
                    {workerStatistics.eventMessageStatistics.embeddingRequests.totalMessages}
                  </td>
                  <td className="text-center">
                    {workerStatistics.eventMessageStatistics.embeddingRequests.processedMessages}
                  </td>
                  <td className="text-center">
                    <span
                      className={
                        workerStatistics.eventMessageStatistics.embeddingRequests.pendingMessages > 0
                          ? 'font-semibold text-warning'
                          : ''
                      }
                    >
                      {workerStatistics.eventMessageStatistics.embeddingRequests.pendingMessages}
                    </span>
                  </td>
                  {/* Embedding Progress */}
                  <td className="text-center">
                    {workerStatistics.eventMessageStatistics.embeddingProgress.totalMessages}
                  </td>
                  <td className="text-center">
                    {workerStatistics.eventMessageStatistics.embeddingProgress.processedMessages}
                  </td>
                  <td className="text-center">
                    <span
                      className={
                        workerStatistics.eventMessageStatistics.embeddingProgress.pendingMessages > 0
                          ? 'font-semibold text-warning'
                          : ''
                      }
                    >
                      {workerStatistics.eventMessageStatistics.embeddingProgress.pendingMessages}
                    </span>
                  </td>
                  {/* Embedding Finished */}
                  <td className="text-center">
                    {workerStatistics.eventMessageStatistics.embeddingFinished.totalMessages}
                  </td>
                  <td className="text-center">
                    {workerStatistics.eventMessageStatistics.embeddingFinished.processedMessages}
                  </td>
                  <td className="text-center">
                    <span
                      className={
                        workerStatistics.eventMessageStatistics.embeddingFinished.pendingMessages > 0
                          ? 'font-semibold text-warning'
                          : ''
                      }
                    >
                      {workerStatistics.eventMessageStatistics.embeddingFinished.pendingMessages}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
