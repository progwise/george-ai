import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { graphql } from '../../../../gql'
import { AssistantBaseFragment } from '../../../../gql/graphql'
import { getAiAssistantsQueryOptions } from '../../../../server-functions/assistant'
import { getConversationQueryOptions } from '../../../../server-functions/conversations'
import { AssistantList } from './-components/assistant-list'
import { useConversationParticipantsMutations } from './-hooks/use-conversation-participants-mutations'

graphql(`
  fragment ConversationAssistantsSettings_Conversation on AiConversation {
    ownerId
    participants {
      id
      __typename
      assistant {
        ...AssistantBase
      }
    }
  }
`)

export const Route = createFileRoute('/_authenticated/conversations/$conversationId/settings/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getConversationQueryOptions(params.conversationId)),
      context.queryClient.ensureQueryData(getAiAssistantsQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const { conversationId } = Route.useParams()
  const {
    data: { aiAssistants },
  } = useSuspenseQuery(getAiAssistantsQueryOptions())
  const { data: conversation } = useSuspenseQuery(getConversationQueryOptions(conversationId))
  const { user } = Route.useRouteContext()

  const isOwner = conversation.ownerId === user.id

  const { addParticipants, removeParticipant } = useConversationParticipantsMutations({
    conversationId: conversation.id,
  })

  const availableAssistants = aiAssistants.filter(
    (assistant) => !conversation.participants.some((participant) => participant.assistant?.id === assistant.id),
  )

  const assistants: AssistantBaseFragment[] = conversation.participants
    .filter((participant) => participant.__typename === 'AssistantParticipant')
    .map((participant) => participant.assistant!)

  const handleUnassign = (assistantId: string) => {
    const participant = conversation.participants.find((participant) => participant.assistantId === assistantId)

    if (participant) {
      removeParticipant(participant.id)
    }
  }

  return (
    <AssistantList
      assistants={assistants}
      availableAssistants={availableAssistants}
      disabled={!isOwner}
      onAssign={(assistantId) => addParticipants({ assistantIds: [assistantId] })}
      onUnassign={(assistantId) => handleUnassign(assistantId)}
    />
  )
}
