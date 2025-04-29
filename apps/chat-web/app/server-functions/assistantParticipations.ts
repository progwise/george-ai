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
  mutation removeAssistantParticipant($participantId: String!) {
    removeAssistantParticipant(id: $participantId) {
      id
    }
  }
`)

export const removeAssistantParticipant = createServerFn({ method: 'POST' })
  .validator((data: { participantId: string }) => z.object({ participantId: z.string() }).parse(data))
  .handler((ctx) =>
    backendRequest(RemoveAssistantParticipantDocument, {
      participantId: ctx.data.participantId,
    }),
  )
