import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getWorkerEntriesQueryOptions } from '../../../components/admin/queries'
import { WorkerRole } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { CpuIcon } from '../../../icons/cpu-icon'
import { ProcessingIcon } from '../../../icons/processing-icon'
import { ServerIcon } from '../../../icons/server-icon'

export const Route = createFileRoute('/_authenticated/admin/workers')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(getWorkerEntriesQueryOptions())])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
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
      workerRole: entry.workerRole,
      lastHeartBeat: entry.lastHeartbeat ? new Date(entry.lastHeartbeat) : null,
    })
    return acc
  }, new Map<string, Array<{ workerRole?: WorkerRole | null; lastHeartBeat?: Date | null }>>())

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
        <div></div>
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
                            <div className="badge badge-sm badge-success">{worker.workerId.replace(/\D/g, '')}</div>
                          ) : (
                            <div className="badge badge-sm badge-error">{worker.workerId.replace(/\D/g, '')}</div>
                          )}
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
                          <div className="flex flex-wrap items-center gap-2">
                            {worker.entries.map((entry) => (
                              <div
                                key={`${worker.workerId}_${entry.workerRole}_${entry.lastHeartBeat}`}
                                className="badge badge-sm badge-info"
                              >
                                {`${entry.workerRole}`}
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
      <div></div>
    </div>
  )
}
