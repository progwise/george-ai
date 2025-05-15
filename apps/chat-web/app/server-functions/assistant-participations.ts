import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from './backend'

const AddAssistantParticipantsDocument = graphql(`
  mutation addAssistantParticipant($assistantId: String!, $userIds: [String!]!, $currentUserId: String!) {
    addAssistantParticipants(assistantId: $assistantId, userIds: $userIds, currentUserId: $currentUserId) {
      id
    }
  }
`)

export const addAssistantParticipants = createServerFn({ method: 'POST' })
  .validator((data: { assistantId: string; userIds: string[]; currentUserId: string }) =>
    z
      .object({
        assistantId: z.string(),
        userIds: z.array(z.string()),
        currentUserId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(AddAssistantParticipantsDocument, {
      assistantId: ctx.data.assistantId,
      userIds: ctx.data.userIds,
      currentUserId: ctx.data.currentUserId,
    }),
  )

const RemoveAssistantParticipantDocument = graphql(`
  mutation removeAssistantParticipant($userId: String!, $assistantId: String!, $currentUserId: String!) {
    removeAssistantParticipant(userId: $userId, assistantId: $assistantId, currentUserId: $currentUserId) {
      id
    }
  }
`)

export const removeAssistantParticipant = createServerFn({ method: 'POST' })
  .validator((data: { userId: string; assistantId: string; currentUserId: string }) =>
    z
      .object({
        userId: z.string(),
        assistantId: z.string(),
        currentUserId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(RemoveAssistantParticipantDocument, {
      userId: ctx.data.userId,
      assistantId: ctx.data.assistantId,
      currentUserId: ctx.data.currentUserId,
    }),
  )
