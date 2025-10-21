import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { getDashboardDataQueryOptions } from '../components/dashboard/get-dashboard-data'
import { useTranslation } from '../i18n/use-translation-hook'

type TabType = 'libraries' | 'lists' | 'conversations' | 'assistants'

const Home = () => {
  const { t } = useTranslation()
  const { user } = Route.useRouteContext()
  const { data } = useSuspenseQuery(getDashboardDataQueryOptions())
  const [activeTab, setActiveTab] = useState<TabType>('libraries')

  const userId = user?.id
  const isAdmin = user?.isAdmin ?? false

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-base-content/70">{t('dashboard.subtitle')}</p>
      </div>

      {/* Overview Cards & System Status */}
      <div className="flex flex-wrap gap-3">
        {/* Task Queues */}
        {data.queueSystemStatus.queues.map((queue) => {
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

          if (isAdmin) {
            return (
              <Link
                key={queue.queueType}
                to="/admin/queues"
                className="stats min-w-[200px] flex-1 shadow transition-shadow hover:shadow-lg"
              >
                {queueCard}
              </Link>
            )
          }

          return (
            <div key={queue.queueType} className="stats min-w-[200px] flex-1 shadow">
              {queueCard}
            </div>
          )
        })}
        {/* AI Service Instances */}
        {data.aiServiceStatus.instances.map((instance) => {
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

          if (isAdmin) {
            return (
              <Link
                key={instance.name}
                to="/admin/ai-services"
                className="stats min-w-[200px] flex-1 shadow transition-shadow hover:shadow-lg"
              >
                {instanceCard}
              </Link>
            )
          }

          return (
            <div key={instance.name} className="stats min-w-[200px] flex-1 shadow">
              {instanceCard}
            </div>
          )
        })}
      </div>

      {/* Tabs for all entities */}
      <div role="tablist" className="tabs tabs-lift">
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === 'libraries' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('libraries')}
        >
          {t('dashboard.tabs.libraries')} ({data.aiLibraries.length})
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === 'lists' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('lists')}
        >
          {t('dashboard.tabs.lists')} ({data.aiLists.length})
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === 'assistants' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('assistants')}
        >
          {t('dashboard.tabs.assistants')} ({data.aiAssistants.length})
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === 'conversations' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          {t('dashboard.tabs.conversations')} ({data.aiConversations.length})
        </button>

        <input type="radio" className="tab hidden" defaultChecked />
        <div className="tab-content bg-base-100 border-base-300 border p-6">
          {/* Libraries Tab */}
          {activeTab === 'libraries' && (
            <div>
              {data.aiLibraries.length > 0 ? (
                <ul className="space-y-2">
                  {data.aiLibraries.map((library) => (
                    <li key={library.id}>
                      <Link
                        to="/libraries/$libraryId"
                        params={{ libraryId: library.id }}
                        className="hover:bg-base-200 flex items-center justify-between rounded p-3 transition-colors"
                      >
                        <span className="truncate font-medium">{library.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="badge badge-sm">
                            {t('dashboard.labels.files', { count: library.filesCount })}
                          </span>
                          <span className="text-base-content/50 text-sm">
                            {new Date(library.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base-content/50">{t('dashboard.emptyStates.noLibraries')}</p>
              )}
            </div>
          )}

          {/* Lists Tab */}
          {activeTab === 'lists' && (
            <div>
              {data.aiLists.length > 0 ? (
                <ul className="space-y-2">
                  {data.aiLists.map((list) => (
                    <li key={list.id}>
                      <Link
                        to="/lists/$listId"
                        params={{ listId: list.id }}
                        className="hover:bg-base-200 flex items-center justify-between rounded p-3 transition-colors"
                      >
                        <span className="truncate font-medium">{list.name}</span>
                        <span className="text-base-content/50 text-sm">
                          {list.owner.id === userId ? t('dashboard.status.owned') : t('dashboard.status.shared')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base-content/50">{t('dashboard.emptyStates.noLists')}</p>
              )}
            </div>
          )}

          {/* Conversations Tab */}
          {activeTab === 'conversations' && (
            <div>
              {data.aiConversations.length > 0 ? (
                <ul className="space-y-2">
                  {data.aiConversations.map((conversation) => (
                    <li key={conversation.id}>
                      <Link
                        to="/conversations/$conversationId"
                        params={{ conversationId: conversation.id }}
                        className="hover:bg-base-200 flex items-center justify-between rounded p-3 transition-colors"
                      >
                        <span className="truncate font-medium">
                          {t('dashboard.labels.conversationWith', { name: conversation.owner.name || 'Unknown' })}
                        </span>
                        <span className="text-base-content/50 text-sm">
                          {new Date(conversation.updatedAt || conversation.createdAt).toLocaleDateString()}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base-content/50">{t('dashboard.emptyStates.noConversations')}</p>
              )}
            </div>
          )}

          {/* Assistants Tab */}
          {activeTab === 'assistants' && (
            <div>
              {data.aiAssistants.length > 0 ? (
                <ul className="space-y-2">
                  {data.aiAssistants.map((assistant) => (
                    <li key={assistant.id}>
                      <Link
                        to="/assistants/$assistantId"
                        params={{ assistantId: assistant.id }}
                        className="hover:bg-base-200 flex items-center justify-between rounded p-3 transition-colors"
                      >
                        <span className="truncate font-medium">{assistant.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base-content/50">{t('dashboard.emptyStates.noAssistants')}</p>
              )}
            </div>
          )}
        </div>
      </div>
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
