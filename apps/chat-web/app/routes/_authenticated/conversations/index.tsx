import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getAiAssistantsQueryOptions } from '../../../components/assistant/get-assistants'
import { ConversationParticipantsDialogButton } from '../../../components/conversation/conversation-participants-dialog-button'
import { getConversationsQueryOptions } from '../../../components/conversation/get-conversations'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/conversations/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getConversationsQueryOptions()),
      context.queryClient.ensureQueryData(getAiAssistantsQueryOptions()),
      context.queryClient.ensureQueryData(getUsersQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const navigate = Route.useNavigate()

  const [conversationsQuery, assistantsQuery, usersQuery] = useSuspenseQueries({
    queries: [getConversationsQueryOptions(), getAiAssistantsQueryOptions(), getUsersQueryOptions()],
  })

  const latestConversation = conversationsQuery.data.aiConversations.at(0)

  if (latestConversation) {
    return navigate({
      to: '/conversations/$conversationId',
      params: { conversationId: latestConversation.id },
      replace: true,
    })
  }

  return (
    <ConversationParticipantsDialogButton
      className="hidden"
      userId={user.id}
      assistants={assistantsQuery.data.aiAssistants}
      users={usersQuery.data.users}
      dialogMode="new"
      isOpen
    />
  )
}
