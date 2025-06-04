import { useSuspenseQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute } from '@tanstack/react-router'

import { getProfileQueryOptions } from '../../../auth/get-profile-query'
import { ConversationForm } from '../../../components/conversation/conversation-form'
import { ConversationHistory } from '../../../components/conversation/conversation-history'
import { ConversationTitle } from '../../../components/conversation/conversation-title'
import { getAiAssistantsQueryOptions } from '../../../server-functions/assistant'
import { getConversationQueryOptions } from '../../../server-functions/conversations'
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
  const { user } = Route.useRouteContext()
  const { conversationId } = Route.useParams()

  const { data: conversation } = useSuspenseQuery(getConversationQueryOptions(conversationId))
  const { data: profile } = useSuspenseQuery(getProfileQueryOptions())

  return (
    <>
      <ConversationTitle
        conversation={conversation}
        userId={user.id}
        className="left-drawer-width fixed right-0 top-16 z-10 max-lg:left-0"
      />

      <div className="flex h-full flex-col">
        <ConversationHistory conversation={conversation} userId={user.id} />
        <ConversationForm conversation={conversation} user={user} profile={profile ?? undefined} />
      </div>

      <Outlet />
    </>
  )
}
