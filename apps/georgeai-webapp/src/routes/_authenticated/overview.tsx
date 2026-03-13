import { createFileRoute } from '@tanstack/react-router'

import { useWorkspace } from '../../components/workspace'
import { WorkspaceDashboardTabs } from '../../components/workspace/workspace-dashboard-tabs'
import { WorkspaceModelProviderCards } from '../../components/workspace/workspace-model-provider-cards'
import { WorkspaceQueueCards } from '../../components/workspace/workspace-queue-cards'
import { WorkspaceStatusCard } from '../../components/workspace/workspace-status-card'
import { useTranslation } from '../../i18n/use-translation-hook'

const RouteComponent = () => {
  const { t } = useTranslation()
  const { user } = Route.useRouteContext()
  const { currentWorkspace } = useWorkspace(user.selectedWorkspaceId)

  return (
    <div className="space-y-8 pt-0">
      <div className="justify-items-center">
        <h1 className="mb-2 text-2xl font-bold">{t('dashboard.title')}</h1>
        {user && currentWorkspace && (
          <p className="text-base-content/70">
            {t('dashboard.subtitle')}
            {currentWorkspace.name}
          </p>
        )}
      </div>

      {/* Overview Cards & System Status */}
      <div className="flex flex-wrap gap-3">
        <WorkspaceStatusCard user={user} currentWorkspace={currentWorkspace} />
        {/* Task Queues */}
        <WorkspaceQueueCards currentWorkspaceRole={currentWorkspace?.role || undefined} />
        {/* AI Service Instances */}
        <WorkspaceModelProviderCards currentWorkspaceRole={currentWorkspace?.role || undefined} />
      </div>

      {/* Tabs for all entities */}

      <WorkspaceDashboardTabs user={user} />
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/overview')({
  component: RouteComponent,
})
