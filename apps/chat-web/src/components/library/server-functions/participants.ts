import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const updateLibraryParticipantsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; userIds: string[] }) =>
    z
      .object({
        libraryId: z.string(),
        userIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation updateLibraryParticipants($libraryId: String!, $userIds: [String!]!) {
          updateLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {
            totalParticipants
            addedParticipants
            removedParticipants
          }
        }
      `),
      {
        libraryId: ctx.data.libraryId,
        userIds: ctx.data.userIds,
      },
    ),
  )

export const removeLibraryParticipantFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; participantId: string }) =>
    z
      .object({
        libraryId: z.string(),
        participantId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation removeLibraryParticipant($libraryId: String!, $participantId: String!) {
          removeLibraryParticipant(libraryId: $libraryId, participantId: $participantId)
        }
      `),
      {
        libraryId: ctx.data.libraryId,
        participantId: ctx.data.participantId,
      },
    ),
  )
