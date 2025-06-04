import { useSuspenseQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { ConversationSelector } from '../../../components/conversation/conversation-selector'
import { DeleteConversationsDialog } from '../../../components/conversation/delete-conversations-dialog'
import { NewConversationButton } from '../../../components/conversation/new-conversation-button'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { getAiAssistantsQueryOptions } from '../../../server-functions/assistant'
import { getConversationsQueryOptions } from '../../../server-functions/conversations'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/conversations')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getAiAssistantsQueryOptions()),
      context.queryClient.ensureQueryData(getUsersQueryOptions()),
      context.queryClient.ensureQueryData(getConversationsQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const drawerCheckboxRef = useRef<HTMLInputElement>(null)
  const { user } = Route.useRouteContext()
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([])
  const { t } = useTranslation()

  const {
    data: { aiAssistants },
  } = useSuspenseQuery(getAiAssistantsQueryOptions())
  const {
    data: { users },
  } = useSuspenseQuery(getUsersQueryOptions())
  const {
    data: { aiConversations },
  } = useSuspenseQuery(getConversationsQueryOptions())

  const handleConversationClick = () => {
    if (drawerCheckboxRef.current) {
      drawerCheckboxRef.current.checked = false
    }
  }

  return (
    <div
      className={twMerge(
        'drawer lg:drawer-open -mx-body grow',
        'min-h-[calc(100dvh_-_--spacing(16))]', // full height minus the top bar
      )}
    >
      <input id="conversation-drawer" type="checkbox" className="drawer-toggle" ref={drawerCheckboxRef} />
      <div className="drawer-content lg:ml-drawer-width flex flex-col">
        <Outlet />
      </div>

      <div
        className={twMerge(
          'drawer-side fixed! max-lg:z-50 lg:top-16',
          'lg:h-[calc(100dvh_-_--spacing(16))]', // full height minus the top bar
        )}
      >
        <label htmlFor="conversation-drawer" className="drawer-overlay" />

        <div className="bg-base-100 lg:w-drawer-width lg:bg-base-200 *:px-body border-base-300 flex h-full flex-col gap-2 border-r pt-4">
          <h2 className="mb-2 text-lg font-semibold">{t('conversations.title')}</h2>

          <div className="flex gap-2">
            <NewConversationButton
              availableAssistants={aiAssistants}
              users={users}
              userId={user.id}
              className="flex-1"
            />

            {selectedConversationIds.length > 0 && (
              <DeleteConversationsDialog
                selectedConversationIds={selectedConversationIds}
                resetSelectedConversationIds={() => setSelectedConversationIds([])}
              />
            )}
          </div>

          <ConversationSelector
            className="min-h-0 flex-1 overflow-y-auto"
            conversations={aiConversations}
            onClick={handleConversationClick}
            onConversationSelect={(conversationId, checked) => {
              if (checked) {
                setSelectedConversationIds((prev) => [...prev, conversationId])
              } else {
                setSelectedConversationIds((prev) => prev.filter((id) => id !== conversationId))
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
