import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { getConversationsQueryOptions } from '../../../components/conversation/get-conversations'

export const Route = createFileRoute('/_authenticated/conversations/')({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(getConversationsQueryOptions()),
})

function RouteComponent() {
  const navigate = Route.useNavigate()

  const [conversationsQuery] = useSuspenseQueries({
    queries: [getConversationsQueryOptions()],
  })
  const latestConversation = conversationsQuery.data.aiConversations.at(0)

  useEffect(() => {
    if (latestConversation) {
      navigate({
        to: '/conversations/$conversationId',
        params: { conversationId: latestConversation.id },
        replace: true,
      })
    }
  }, [latestConversation, navigate])

  return null
}
