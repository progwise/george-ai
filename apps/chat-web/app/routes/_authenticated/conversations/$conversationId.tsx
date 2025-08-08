import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { getProfileQueryOptions } from '../../../auth/get-profile-query'
import { getAiAssistantsQueryOptions } from '../../../components/assistant/get-assistants'
import { ConversationForm } from '../../../components/conversation/conversation-form'
import { ConversationHistory } from '../../../components/conversation/conversation-history'
import { ConversationParticipants } from '../../../components/conversation/conversation-participants'
import { ConversationParticipantsDialogButton } from '../../../components/conversation/conversation-participants-dialog-button'
import { ConversationSelector } from '../../../components/conversation/conversation-selector'
import { DeleteLeaveConversationDialog } from '../../../components/conversation/delete-leave-conversation-dialog'
import { getConversationQueryOptions } from '../../../components/conversation/get-conversation'
import { getConversationsQueryOptions } from '../../../components/conversation/get-conversations'
import { MenuIcon } from '../../../icons/menu-icon'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/conversations/$conversationId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getUsersQueryOptions()),
      context.queryClient.ensureQueryData(getAiAssistantsQueryOptions()),
      context.queryClient.ensureQueryData(getConversationQueryOptions(params.conversationId)),
      context.queryClient.ensureQueryData(getProfileQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const drawerCheckboxRef = useRef<HTMLInputElement>(null)
  const { user } = Route.useRouteContext()
  const { conversationId } = Route.useParams()

  const {
    data: { aiConversations },
  } = useSuspenseQuery(getConversationsQueryOptions())

  const handleConversationClick = () => {
    if (drawerCheckboxRef.current) {
      drawerCheckboxRef.current.checked = false
    }
  }
  const {
    data: { users },
  } = useSuspenseQuery(getUsersQueryOptions())
  const {
    data: { aiAssistants },
  } = useSuspenseQuery(getAiAssistantsQueryOptions())
  const { data: conversation } = useSuspenseQuery(getConversationQueryOptions(conversationId))
  const { data: profile } = useSuspenseQuery(getProfileQueryOptions())

  return (
    <div
      className={twMerge(
        'drawer lg:drawer-open grow',
        'min-h-[calc(100dvh_-_--spacing(16))]', // full height minus the top bar
      )}
    >
      <input id="conversation-drawer" type="checkbox" className="drawer-toggle" ref={drawerCheckboxRef} />
      <div className="drawer-content flex flex-col">
        <div>
          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:w-64">
              <label htmlFor="conversation-drawer" className="drawer-button btn btn-sm lg:hidden">
                <MenuIcon className="size-6" />
              </label>
              <ConversationParticipantsDialogButton assistants={aiAssistants} users={users} userId={user.id} />
              <div>
                <DeleteLeaveConversationDialog conversation={conversation} userId={user.id} />
              </div>
            </div>
            <div className="flex justify-between">
              <ConversationParticipants
                conversation={conversation}
                assistants={aiAssistants}
                users={users}
                userId={user.id}
              />
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col">
          <ConversationHistory conversation={conversation} userId={user.id} />
          <ConversationForm conversation={conversation} user={user} profile={profile ?? undefined} />
        </div>
      </div>

      <div
        className={twMerge(
          'drawer-side max-lg:z-50 lg:top-16',
          'lg:h-[calc(100dvh_-_--spacing(16))]', // full height minus the top bar
        )}
      >
        <label htmlFor="conversation-drawer" className="drawer-overlay" />
        <div className="bg-base-100 flex w-80 flex-col items-center bg-auto p-4 lg:p-0 lg:pl-4 lg:pt-4">
          <ConversationSelector
            conversations={aiConversations}
            selectedConversationId={conversationId}
            onClick={handleConversationClick}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  )
}
