import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from './backend'

const AddParticipantsDocument = graphql(`
  mutation addParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {
    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {
      id
    }
  }
`)

export const addConversationParticipants = createServerFn({ method: 'POST' })
  .validator((data: { conversationId: string; userIds: string[]; assistantIds: string[]; ownerId: string }) =>
    z
      .object({
        conversationId: z.string(),
        userIds: z.array(z.string()),
        assistantIds: z.array(z.string()),
        ownerId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) => {
    if (!ctx.data.ownerId) {
      throw new Error('ownerId is required')
    }
    backendRequest(AddParticipantsDocument, {
      ownerId: ctx.data.ownerId,
      conversationId: ctx.data.conversationId,
      userIds: ctx.data.userIds,
      assistantIds: ctx.data.assistantIds,
    })
  })

const RemoveParticipantDocument = graphql(`
  mutation removeParticipant($participantId: String!) {
    removeConversationParticipant(id: $participantId) {
      id
    }
  }
`)

export const removeConversationParticipant = createServerFn({ method: 'POST' })
  .validator((data: { participantId: string }) => z.object({ participantId: z.string() }).parse(data))
  .handler((ctx) =>
    backendRequest(RemoveParticipantDocument, {
      participantId: ctx.data.participantId,
    }),
  )
