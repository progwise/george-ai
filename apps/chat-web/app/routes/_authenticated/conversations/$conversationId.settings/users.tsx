import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { graphql } from '../../../../gql'
import { getConversationQueryOptions } from '../../../../server-functions/conversations'
import { getUsersQueryOptions } from '../../../../server-functions/users'
import { UserList } from './-components/user-list'
import { useConversationParticipantsMutations } from './-hooks/use-conversation-participants-mutations'
import { useCreateInvitation } from './-hooks/use-create-invitation'

graphql(`
  fragment ConversationUsersSettings_Conversation on AiConversation {
    ownerId
    participants {
      id
      __typename
      user {
        ...UserAvatar_User
      }
    }
  }
`)

export const Route = createFileRoute('/_authenticated/conversations/$conversationId/settings/users')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getConversationQueryOptions(params.conversationId)),
      context.queryClient.ensureQueryData(getUsersQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const { conversationId } = Route.useParams()
  const { user } = Route.useRouteContext()

  const { data: conversation } = useSuspenseQuery(getConversationQueryOptions(conversationId))
  const {
    data: { users },
  } = useSuspenseQuery(getUsersQueryOptions())
  const { addParticipants, removeParticipant } = useConversationParticipantsMutations({
    conversationId: conversation.id,
  })
  const { createInvitation, pendingEmailInvites, invitedEmails } = useCreateInvitation({ conversationId })

  const handleInvite = (data: { email: string; allowDifferentEmail: boolean; allowMultipleParticipants: boolean }) =>
    createInvitation({
      email: data.email,
      allowDifferentEmailAddress: data.allowDifferentEmail,
      allowMultipleParticipants: data.allowMultipleParticipants,
    })

  const handleUnassign = (userId: string) => {
    const participantId = conversation.participants.find((participant) => participant.userId === userId)?.id

    if (!participantId) {
      return
    }

    removeParticipant(participantId)
  }

  const unassignedUsers = users.filter(
    (user) => !conversation.participants.some((participant) => participant.userId === user.id),
  )

  const isOwner = conversation.ownerId === user.id

  return (
    <UserList
      userId={user.id}
      users={conversation.participants
        .filter((participant) => participant.__typename === 'HumanParticipant')
        .map((participant) => participant.user!)}
      availableUsers={unassignedUsers}
      emailInvites={invitedEmails}
      pendingEmailInvites={pendingEmailInvites}
      disabled={!isOwner}
      onAssign={(userId) => addParticipants({ userIds: [userId] })}
      onUnassign={handleUnassign}
      onInvite={handleInvite}
    />
  )
}
