import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { Workspace } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { getModelProviderStatusQueryOptions } from './queries'

interface WorkspaceModelProviderCardsProps {
  currentWorkspace: Workspace | undefined
}
export const WorkspaceModelProviderCards = ({ currentWorkspace }: WorkspaceModelProviderCardsProps) => {
  const { t } = useTranslation()

  const { data: modelProviderStatus, isLoading, error } = useQuery(getModelProviderStatusQueryOptions())

  if (!currentWorkspace || isLoading) {
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

  if (error || !modelProviderStatus) {
    return (
      <div className="stats min-w-50 flex-1 shadow-sm">
        <div className="stat py-3">
          <div className="stat-title text-sm">Error loading model provider status</div>
        </div>
      </div>
    )
  }
  return (
    <>
      {modelProviderStatus.instances.map((instance) => {
        const instanceCard = (
          <div className="stat py-3">
            <div className="stat-title text-sm">{instance.name}</div>
            <div className="stat-value text-2xl">
              {instance.isOnline ? t('dashboard.status.online') : t('dashboard.status.offline')}
            </div>
            <div className={`stat-desc text-xs ${instance.isOnline ? 'text-success' : 'text-error'}`}>
              {instance.type} ·{' '}
              {instance.isOnline
                ? t('dashboard.labels.models', { count: instance.availableModels?.length || 0 })
                : t('dashboard.status.offline')}
            </div>
          </div>
        )

        if (currentWorkspace.role === 'admin' || currentWorkspace.role === 'owner') {
          return (
            <Link
              key={instance.name}
              to="/admin/ai-services"
              className="stats min-w-50 flex-1 shadow-sm transition-shadow hover:shadow-lg"
            >
              {instanceCard}
            </Link>
          )
        }

        return (
          <div key={instance.name} className="stats min-w-50 flex-1 shadow-sm">
            {instanceCard}
          </div>
        )
      })}
    </>
  )
}
