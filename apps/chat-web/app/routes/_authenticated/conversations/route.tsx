import { useSuspenseQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { ConversationSelector } from '../../../components/conversation/conversation-selector'
import { getAiAssistantsQueryOptions } from '../../../server-functions/assistant'
import { getConversationsQueryOptions } from '../../../server-functions/conversations'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/conversations')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getAiAssistantsQueryOptions(context.user.id)),
      context.queryClient.ensureQueryData(getUsersQueryOptions(context.user.id)),
      context.queryClient.ensureQueryData(getConversationsQueryOptions(context.user.id)),
    ])
  },
})

function RouteComponent() {
  const drawerCheckboxRef = useRef<HTMLInputElement>(null)
  const { user } = Route.useRouteContext()
  const { conversationId } = useParams({ strict: false })

  const {
    data: { aiAssistants },
  } = useSuspenseQuery(getAiAssistantsQueryOptions(user.id))
  const {
    data: { users },
  } = useSuspenseQuery(getUsersQueryOptions(user.id))
  const {
    data: { aiConversations },
  } = useSuspenseQuery(getConversationsQueryOptions(user.id))

  const handleConversationClick = () => {
    if (drawerCheckboxRef.current) {
      drawerCheckboxRef.current.checked = false
    }
  }

  return (
    <div
      className={twMerge(
        'drawer lg:drawer-open grow',
        'min-h-[calc(100dvh_-_--spacing(16))]', // full height minus the top bar
      )}
    >
      <input id="conversation-drawer" type="checkbox" className="drawer-toggle" ref={drawerCheckboxRef} />
      <div className="drawer-content flex flex-col">
        <Outlet />
      </div>

      <div
        className={twMerge(
          'drawer-side max-lg:z-50 lg:top-16',
          'lg:h-[calc(100dvh_-_--spacing(16))]', // full height minus the top bar
        )}
      >
        <label htmlFor="conversation-drawer" className="drawer-overlay" />
        <div className="bg-base-200 flex h-full w-80 flex-col items-center lg:pt-6">
          <div className="flex-1 overflow-scroll px-2">
            <ConversationSelector
              conversations={aiConversations}
              selectedConversationId={conversationId}
              onClick={handleConversationClick}
              userId={user.id}
              humans={users}
              assistants={aiAssistants}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
