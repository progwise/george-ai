import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getProfileQueryOptions } from '../../../auth/get-profile-query'
import { ConversationForm } from '../../../components/conversation/conversation-form'
import { ConversationHistory } from '../../../components/conversation/conversation-history'
import { ConversationParticipants } from '../../../components/conversation/conversation-participants'
import { ConversationParticipantsDialogButton } from '../../../components/conversation/conversation-participants-dialog-button'
import { DeleteLeaveConversationDialog } from '../../../components/conversation/delete-leave-conversation-dialog'
import { NewConversationSelector } from '../../../components/conversation/new-conversation-selector'
import { MenuIcon } from '../../../icons/menu-icon'
import { getAssignableAssistantsQueryOptions } from '../../../server-functions/assistant'
import { getConversationQueryOptions } from '../../../server-functions/conversations'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/conversations/$conversationId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getUsersQueryOptions()),
      context.queryClient.ensureQueryData(getAssignableAssistantsQueryOptions()),
      context.queryClient.ensureQueryData(getConversationQueryOptions(params.conversationId)),
      context.queryClient.ensureQueryData(getProfileQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const { conversationId } = Route.useParams()
  const {
    data: { users },
  } = useSuspenseQuery(getUsersQueryOptions())
  const {
    data: { aiAssistants },
  } = useSuspenseQuery(getAssignableAssistantsQueryOptions())
  const { data: conversation } = useSuspenseQuery(getConversationQueryOptions(conversationId))
  const { data: profile } = useSuspenseQuery(getProfileQueryOptions())

  return (
    <>
      <div className="bg-base-100 lg:rounded-r-box sticky top-16 z-30 shadow-md">
        <div className="flex flex-row flex-wrap items-center justify-between gap-2 p-1 pt-2 lg:hidden">
          <div className="flex gap-2">
            <label htmlFor="conversation-drawer" className="drawer-button btn btn-sm">
              <MenuIcon className="size-6" />
            </label>
            <NewConversationSelector users={users} assistants={aiAssistants} userId={user.id} />
          </div>

          <div className="flex">
            <ConversationParticipantsDialogButton
              conversation={conversation}
              assistants={aiAssistants}
              users={users}
              dialogMode="add"
              userId={user.id}
            />
            <DeleteLeaveConversationDialog conversation={conversation} userId={user.id} />
          </div>
        </div>

        <div className="flex items-center justify-end p-1">
          <ConversationParticipants
            conversation={conversation}
            assistants={aiAssistants}
            users={users}
            userId={user.id}
          />
          <div className="hidden lg:flex">
            <DeleteLeaveConversationDialog conversation={conversation} userId={user.id} />
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col">
        <ConversationHistory conversation={conversation} userId={user.id} />
        <ConversationForm conversation={conversation} user={user} profile={profile ?? undefined} />
      </div>
    </>
  )
}
