import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { ConversationParticipantsDialogButton } from '../../../components/conversation/conversation-participants-dialog-button'
import { getAssignableAssistantsQueryOptions } from '../../../server-functions/assistant'
import { getConversationsQueryOptions } from '../../../server-functions/conversations'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/conversations/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getConversationsQueryOptions()),
      context.queryClient.ensureQueryData(getAssignableAssistantsQueryOptions()),
      context.queryClient.ensureQueryData(getUsersQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const navigate = Route.useNavigate()

  const [conversationsQuery, assistantsQuery, usersQuery] = useSuspenseQueries({
    queries: [getConversationsQueryOptions(), getAssignableAssistantsQueryOptions(), getUsersQueryOptions()],
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
