import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { getQueueStatusQueryOptions } from '../../../components/admin/queue-management/get-queue-status'
import { QueueManagementPanel } from '../../../components/admin/queue-management/queue-management-panel'
import { ClientDate } from '../../../components/client-date'

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
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Queue Management</h1>
        <div className="flex gap-2">
          <label className="label cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="label-text ml-2">Auto Refresh (5s)</span>
          </label>
          <button className="btn btn-primary" onClick={handleRefresh} type="button">
            Refresh Now
          </button>
        </div>
      </div>

      <QueueManagementPanel queueStatus={queueStatus} />

      <div className="mt-8 text-center text-sm opacity-50">
        Last updated: <ClientDate date={queueStatus.lastUpdated} />
      </div>
    </div>
  )
}
