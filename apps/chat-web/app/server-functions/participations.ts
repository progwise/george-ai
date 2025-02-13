import { createServerFn } from '@tanstack/start'
import { graphql } from '../gql'
import { backendRequest } from './backend'

const AddParticipantsDocument = graphql(`
  mutation addParticipant(
    $conversationId: String!
    $userIds: [String!]
    $assistantIds: [String!]
  ) {
    addConversationParticipants(
      conversationId: $conversationId
      userIds: $userIds
      assistantIds: $assistantIds
    ) {
      id
    }
  }
`)

export const addConversationParticipants = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      conversationId: string
      userIds: string[]
      assistantIds: string[]
    }) => data,
  )
  .handler(async (ctx) =>
    backendRequest(AddParticipantsDocument, {
      conversationId: ctx.data.conversationId,
      userIds: ctx.data.userIds,
      assistantIds: ctx.data.assistantIds,
    }),
  )

const RemoveParticipantDocument = graphql(`
  mutation removeParticipant($participantId: String!) {
    removeConversationParticipant(id: $participantId) {
      id
    }
  }
`)

export const removeConversationParticipant = createServerFn({ method: 'POST' })
  .validator((data: { participantId: string }) => data)
  .handler(async (ctx) =>
    backendRequest(RemoveParticipantDocument, {
      participantId: ctx.data.participantId,
    }),
  )
