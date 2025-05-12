import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { ConversationParticipantsDialog } from '../../../components/conversation/conversation-participants-dialog'
import { getAssignableAssistantsQueryOptions } from '../../../server-functions/assistant'
import { getConversationsQueryOptions } from '../../../server-functions/conversations'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/conversations/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getConversationsQueryOptions(context.user.id)),
      context.queryClient.ensureQueryData(getAssignableAssistantsQueryOptions(context.user.id)),
      context.queryClient.ensureQueryData(getUsersQueryOptions(context.user.id)),
    ])
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const navigate = Route.useNavigate()

  const [conversationsQuery, assistantsQuery, usersQuery] = useSuspenseQueries({
    queries: [
      getConversationsQueryOptions(user.id),
      getAssignableAssistantsQueryOptions(user.id),
      getUsersQueryOptions(user.id),
    ],
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
    <ConversationParticipantsDialog
      className="hidden"
      userId={user.id}
      assistants={assistantsQuery.data.aiAssistants}
      users={usersQuery.data.users}
      dialogMode="new"
      isOpen
    />
  )
}
