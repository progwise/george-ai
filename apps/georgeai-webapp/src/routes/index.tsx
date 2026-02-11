import { createFileRoute, redirect } from '@tanstack/react-router'

import { getDashboardDataQueryOptions } from '../components/dashboard/get-dashboard-data'
import { WorkspaceDashboardTabs } from '../components/workspace/workspace-dashboard-tabs'
import { WorkspaceModelProviderCards } from '../components/workspace/workspace-model-provider-cards'
import { WorkspaceQueueCards } from '../components/workspace/workspace-queue-cards'
import { WorkspaceStatusCard } from '../components/workspace/workspace-status-card'
import { useTranslation } from '../i18n/use-translation-hook'

const Home = () => {
  const { t } = useTranslation()
  const { user } = Route.useRouteContext()

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-base-content/70">{t('dashboard.subtitle')}</p>
      </div>

      {/* Overview Cards & System Status */}
      <div className="flex flex-wrap gap-3">
        {user && <WorkspaceStatusCard user={user} />}
        {/* Task Queues */}
        {user && <WorkspaceQueueCards user={user} />}
        {/* AI Service Instances */}
        {user && <WorkspaceModelProviderCards user={user} />}
      </div>

      {/* Tabs for all entities */}

      {user && <WorkspaceDashboardTabs user={user} />}
    </div>
  )
}

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // If user is not authenticated, redirect to login
    if (!context.user) {
      throw redirect({
        to: '/login',
      })
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(getDashboardDataQueryOptions()),
  component: Home,
})
