import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const updateListParticipants = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        listId: z.string(),
        userIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation updateListParticipants($listId: String!, $userIds: [String!]!) {
          updateListParticipants(listId: $listId, userIds: $userIds) {
            addedParticipants
            removedParticipants
            totalParticipants
          }
        }
      `),
      {
        listId: ctx.data.listId,
        userIds: ctx.data.userIds,
      },
    ),
  )

export const removeListParticipant = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        listId: z.string(),
        participantId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation removeListParticipant($listId: String!, $participantId: String!) {
          removeListParticipant(listId: $listId, participantId: $participantId)
        }
      `),
      {
        listId: ctx.data.listId,
        participantId: ctx.data.participantId,
      },
    ),
  )
