import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from './backend'

const AddAssistantParticipantsDocument = graphql(`
  mutation addAssistantParticipant($assistantId: String!, $userIds: [String!]!) {
    addAssistantParticipants(assistantId: $assistantId, userIds: $userIds) {
      id
    }
  }
`)

export const addAssistantParticipants = createServerFn({ method: 'POST' })
  .validator((data: { assistantId: string; userIds: string[] }) =>
    z
      .object({
        assistantId: z.string(),
        userIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(AddAssistantParticipantsDocument, {
      assistantId: ctx.data.assistantId,
      userIds: ctx.data.userIds,
    }),
  )

const RemoveAssistantParticipantDocument = graphql(`
  mutation removeAssistantParticipant($assistantId: String!, $userId: String!) {
    removeAssistantParticipant(assistantId: $assistantId, userId: $userId) {
      id
    }
  }
`)

export const removeAssistantParticipant = createServerFn({ method: 'POST' })
  .validator((data: { assistantId: string; userId: string }) =>
    z
      .object({
        assistantId: z.string(),
        userId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(RemoveAssistantParticipantDocument, {
      assistantId: ctx.data.assistantId,
      userId: ctx.data.userId,
    }),
  )

const LeaveAssistantParticipantDocument = graphql(`
  mutation leaveAssistantParticipant($assistantId: String!) {
    leaveAssistantParticipant(assistantId: $assistantId) {
      id
    }
  }
`)

export const leaveAssistantParticipant = createServerFn({ method: 'POST' })
  .validator((data: { assistantId: string }) =>
    z
      .object({
        assistantId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(LeaveAssistantParticipantDocument, {
      assistantId: ctx.data.assistantId,
    }),
  )
