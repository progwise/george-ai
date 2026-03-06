import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { useWorkspace } from '.'
import { CurrentUserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { SearchIcon } from '../../icons/search-icon'
import { AssistantNewDialog } from '../assistant/assistant-new-dialog'
import { getAiAssistantsQueryOptions } from '../assistant/get-assistants'
import { ClientDate } from '../client-date'
import { getConversationsQueryOptions } from '../conversation/get-conversations'
import { NewLibraryDialog } from '../library/new-library-dialog'
import { getLibrariesQueryOptions } from '../library/queries'
import { NewListDialog } from '../lists/new-list-dialog'
import { getListsQueryOptions } from '../lists/queries'

type TabType = 'libraries' | 'lists' | 'conversations' | 'assistants'

export const WorkspaceDashboardTabs = ({ user }: { user: CurrentUserFragment }) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('libraries')

  // Dialog refs for creating new resources
  const newLibraryDialogRef = useRef<HTMLDialogElement>(null)
  const newListDialogRef = useRef<HTMLDialogElement>(null)
  const newAssistantDialogRef = useRef<HTMLDialogElement>(null)
  const { currentWorkspace } = useWorkspace(user)

  // TODO: Pagination
  const { data: libraries } = useQuery(getLibrariesQueryOptions())
  const { data: lists } = useQuery(getListsQueryOptions())
  const { data: assistants } = useQuery(getAiAssistantsQueryOptions())
  const { data: conversations } = useQuery(getConversationsQueryOptions())

  const tabContentSkeleton = (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-32 skeleton" />
        <div className="h-8 w-28 skeleton rounded-sm" />
      </div>
      <ul className="space-y-2">
        {[1, 2, 3].map((i) => (
          <li key={i} className="flex items-center justify-between p-3">
            <div className="h-5 w-48 skeleton" />
            <div className="h-4 w-24 skeleton" />
          </li>
        ))}
      </ul>
    </div>
  )

  if (!currentWorkspace) {
    return (
      <div role="tablist" className="tabs-lift tabs">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="tab">
            <div className="h-4 w-20 skeleton" />
          </div>
        ))}
        <input type="radio" className="tab hidden" defaultChecked />
        <div className="tab-content border border-base-300 bg-base-100">{tabContentSkeleton}</div>
      </div>
    )
  }
  const TAB_LIST_MAX_HEIGHT = 'max-h-[46vh]'

  return (
    <>
      <div role="tablist" className="tabs-lift tabs">
        <a
          role="tab"
          className={`tab ${activeTab === 'libraries' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('libraries')}
        >
          {t('dashboard.tabs.libraries')} ({currentWorkspace.librariesCount})
        </a>
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === 'lists' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('lists')}
        >
          {t('dashboard.tabs.lists')} ({currentWorkspace.listsCount})
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === 'assistants' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('assistants')}
        >
          {t('dashboard.tabs.assistants')} ({currentWorkspace.assistantsCount})
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${activeTab === 'conversations' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          {t('dashboard.tabs.conversations')} ({currentWorkspace.conversationsCount})
        </button>

        <input type="radio" className="tab hidden" defaultChecked />
        <div className="tab-content border border-base-300 bg-base-100 p-6">
          {/* Libraries Tab */}
          {activeTab === 'libraries' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('dashboard.tabs.libraries')}</h2>
                <button
                  type="button"
                  onClick={() => newLibraryDialogRef.current?.showModal()}
                  className="btn btn-sm btn-primary"
                  title={t('libraries.addNewButton')}
                  aria-label={t('libraries.addNewButton')}
                >
                  <PlusIcon className="size-4" />
                  {t('libraries.addNewButton')}
                </button>
              </div>
              {!libraries ? (
                tabContentSkeleton
              ) : libraries.items.length > 0 ? (
                // Height left available after top nav + status cards + tab chrome
                <ul className={`${TAB_LIST_MAX_HEIGHT} space-y-2 overflow-y-auto`}>
                  {libraries.items.map((library) => (
                    <li key={library.id}>
                      <Link
                        to="/libraries/$libraryId"
                        params={{ libraryId: library.id }}
                        className="flex items-center justify-between rounded-sm p-3 transition-colors hover:bg-base-200"
                      >
                        <span className="truncate font-medium">{library.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="badge badge-sm">
                            {t('dashboard.labels.files', { count: library.filesCount })}
                          </span>
                          <span className="text-sm text-base-content/50">
                            <ClientDate date={library.updatedAt} format="date" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                  {libraries.items.length < libraries.totalCount && (
                    <li className="text-base-content/75">
                      <Link
                        to="/search"
                        className="flex flex-1 place-content-center items-center gap-2 rounded-lg p-2 hover:bg-accent/20 hover:text-base-content"
                      >
                        Search through {libraries.totalCount - libraries.items.length} more libraries
                        <SearchIcon />
                      </Link>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-base-content/50">{t('dashboard.emptyStates.noLibraries')}</p>
              )}
            </div>
          )}

          {/* Lists Tab */}
          {activeTab === 'lists' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('dashboard.tabs.lists')}</h2>
                <button
                  type="button"
                  onClick={() => newListDialogRef.current?.showModal()}
                  className="btn btn-sm btn-primary"
                  title={t('lists.createListButtonText')}
                  aria-label={t('lists.createListButtonText')}
                >
                  <PlusIcon className="size-4" />
                  {t('lists.createListButtonText')}
                </button>
              </div>
              {!lists ? (
                tabContentSkeleton
              ) : lists.aiLists.length > 0 ? (
                <ul className={`${TAB_LIST_MAX_HEIGHT} space-y-2 overflow-y-auto`}>
                  {lists.aiLists.map((list) => (
                    <li key={list.id}>
                      <Link
                        to="/lists/$listId"
                        params={{ listId: list.id }}
                        className="flex items-center justify-between rounded-sm p-3 transition-colors hover:bg-base-200"
                      >
                        <span className="truncate font-medium">{list.name}</span>
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
              {!conversations ? (
                tabContentSkeleton
              ) : conversations.aiConversations.length > 0 ? (
                <ul className={`${TAB_LIST_MAX_HEIGHT} space-y-2 overflow-y-auto`}>
                  {conversations.aiConversations.map((conversation) => (
                    <li key={conversation.id}>
                      <Link
                        to="/conversations/$conversationId"
                        params={{ conversationId: conversation.id }}
                        className="flex items-center justify-between rounded-sm p-3 transition-colors hover:bg-base-200"
                      >
                        <span className="truncate font-medium">
                          {t('dashboard.labels.conversationWith', { name: conversation.owner.name || 'Unknown' })}
                        </span>
                        <span className="text-sm text-base-content/50">
                          <ClientDate date={conversation.updatedAt || conversation.createdAt} format="date" />
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
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('dashboard.tabs.assistants')}</h2>
                <button
                  type="button"
                  onClick={() => newAssistantDialogRef.current?.showModal()}
                  className="btn btn-sm btn-primary"
                  title={t('assistants.addNewButton')}
                  aria-label={t('assistants.addNewButton')}
                >
                  <PlusIcon className="size-4" />
                  {t('assistants.addNewButton')}
                </button>
              </div>
              {!assistants ? (
                tabContentSkeleton
              ) : assistants.aiAssistants.length > 0 ? (
                <ul className={`${TAB_LIST_MAX_HEIGHT} space-y-2 overflow-y-auto`}>
                  {assistants.aiAssistants.map((assistant) => (
                    <li key={assistant.id}>
                      <Link
                        to="/assistants/$assistantId"
                        params={{ assistantId: assistant.id }}
                        className="flex items-center justify-between rounded-sm p-3 transition-colors hover:bg-base-200"
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

      {/* Dialog components - reused from dedicated routes */}
      <NewLibraryDialog ref={newLibraryDialogRef} />
      <NewListDialog ref={newListDialogRef} />
      <AssistantNewDialog ref={newAssistantDialogRef} />
    </>
  )
}
