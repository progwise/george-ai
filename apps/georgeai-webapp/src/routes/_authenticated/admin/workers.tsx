import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getWorkerEntriesQueryOptions } from '../../../components/admin/queries'
import { ManageWorkersMenu } from '../../../components/admin/workers/manage-workers-menu'
import { getWorkspaceProcessStatisticsQueryOptions } from '../../../components/workspace/queries'
import { WorkerType } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { CpuIcon } from '../../../icons/cpu-icon'
import { ProcessingIcon } from '../../../icons/processing-icon'
import { ServerIcon } from '../../../icons/server-icon'
import { ShieldCheckIcon } from '../../../icons/shield-check-icon'

export const Route = createFileRoute('/_authenticated/admin/workers')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getWorkspaceProcessStatisticsQueryOptions({ workspaceId: context.workspaceId }),
      ),
      context.queryClient.ensureQueryData(getWorkerEntriesQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const { workspaceId } = Route.useRouteContext()

  const { data: processStatistics } = useSuspenseQuery({
    ...getWorkspaceProcessStatisticsQueryOptions({ workspaceId }),
    refetchInterval: 5000, // Override refetch interval for auto-refresh
  })

  const { data: workerEntries } = useSuspenseQuery({
    ...getWorkerEntriesQueryOptions(),
    refetchInterval: 7000, // Override refetch interval for auto-refresh
  })

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

  const now = new Date()

  const groupedWorkerEntries = workerEntries.reduce((acc, entry) => {
    const key = entry.workerId || 'unknown'
    if (!acc.has(key)) {
      acc.set(key, [])
    }
    acc.get(key)!.push({
      workerType: entry.workerType,
      lastHeartBeat: entry.lastHeartbeat ? new Date(entry.lastHeartbeat) : null,
    })
    return acc
  }, new Map<string, Array<{ workerType?: WorkerType | null; lastHeartBeat?: Date | null }>>())

  const workers = Array.from(groupedWorkerEntries.entries()).map(([workerId, entries]) => {
    const healthy = entries.some(
      (entry) => entry.lastHeartBeat && now.getTime() - entry.lastHeartBeat.getTime() < 60000,
    )
    const lastHeartbeatAt = entries
      .map((entry) => entry.lastHeartBeat)
      .filter((date): date is Date => date !== undefined && date !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0]

    return {
      workerId,
      healthy,
      entries,
      lastHeartbeatAt,
    }
  })

  // const workers = [
  //   { healthy: true, lastHeartbeatAt: new Date().toISOString(), workerId: 'worker-1', workerType: 'type-A' },
  //   {
  //     healthy: false,
  //     lastHeartbeatAt: new Date(now.getTime() - 600000).toISOString(),
  //     workerId: 'worker-2',
  //     workerType: 'type-B',
  //   },
  // ] // Dummy data for workers
  const totalWorkers = workers.length

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
            <div className="stat-value text-secondary"></div>
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
                          <div>{formatTimeAgo(worker.lastHeartbeatAt.toISOString())}</div>
                          <div className="text-xs text-base-content/60">
                            {new Date(worker.lastHeartbeatAt).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {worker.entries.map((entry) => (
                              <div
                                key={`${worker.workerId}_${entry.workerType}_${entry.lastHeartBeat}`}
                                className="badge badge-sm badge-primary"
                              >
                                {`${entry.workerType} (${entry.lastHeartBeat ? `${formatTimeAgo(entry.lastHeartBeat.toISOString())}` : ''})`}
                              </div>
                            ))}
                          </div>
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
      <div>
        {processStatistics && (
          <pre className="rounded-md bg-base-200 p-4">
            <code>{JSON.stringify(processStatistics, null, 2)}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
