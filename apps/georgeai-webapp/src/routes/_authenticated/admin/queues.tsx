import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { getQueueStatusQueryOptions } from '../../../components/admin/queue-management/get-queue-status'
import { QueueManagementPanel } from '../../../components/admin/queue-management/queue-management-panel'
import { ClientDate } from '../../../components/client-date'
import { ListViewIcon } from '../../../icons/list-view-icon'

export const Route = createFileRoute('/_authenticated/admin/queues')({
  component: QueueManagementAdminPage,
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(getQueueStatusQueryOptions())])
  },
})

function QueueManagementAdminPage() {
  const { queryClient } = Route.useRouteContext()
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Use suspense query - data is guaranteed to be available
  const { data: queueStatus } = useSuspenseQuery({
    ...getQueueStatusQueryOptions(),
    refetchInterval: autoRefresh ? 5000 : false, // Override refetch interval for auto-refresh
  })

  // Manual refresh function
  const handleRefresh = () => {
    queryClient.invalidateQueries(getQueueStatusQueryOptions())
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-linear-to-br from-accent/20 to-accent/10 p-3 shadow-lg">
            <ListViewIcon className="size-8 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Queue Management</h1>
            <p className="text-lg opacity-70">Monitor and control background processing queues</p>
          </div>
        </div>
        <div className="flex gap-2">
          <label className="label cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="ml-2">Auto Refresh (5s)</span>
          </label>
          <button className="btn btn-primary" onClick={handleRefresh} type="button">
            Refresh Now
          </button>
        </div>
      </div>

      <QueueManagementPanel queueStatus={queueStatus} />

      <div className="text-center text-sm opacity-50">
        Last updated: <ClientDate date={queueStatus.lastUpdated} />
      </div>
    </div>
  )
}
