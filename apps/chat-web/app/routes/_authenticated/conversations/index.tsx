import { useSuspenseQueries } from '@tanstack/react-query'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { NewConversationDialog } from '../../../components/conversation/new-conversation-dialog'
import { getAiAssistantsQueryOptions } from '../../../server-functions/assistant'
import { getConversationsQueryOptions } from '../../../server-functions/conversations'
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

  const [conversationsQuery, assistantsQuery, usersQuery] = useSuspenseQueries({
    queries: [getConversationsQueryOptions(), getAiAssistantsQueryOptions(), getUsersQueryOptions()],
  })
  const [newConversationOpen, setNewConversationOpen] = useState(true)

  const latestConversation = conversationsQuery.data.aiConversations.at(0)

  if (latestConversation) {
    return <Navigate to="/conversations/$conversationId" params={{ conversationId: latestConversation.id }} replace />
  }

  return (
    <NewConversationDialog
      allAssistants={assistantsQuery.data.aiAssistants}
      allUsers={usersQuery.data.users}
      userId={user.id}
      open={newConversationOpen}
      onClose={() => setNewConversationOpen(false)}
    />
  )
}
