import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from './backend'

const AddLibraryParticipantsDocument = graphql(`
  mutation addLibraryParticipant($libraryId: String!, $userIds: [String!]!) {
    addLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {
      id
    }
  }
`)

export const addLibraryParticipants = createServerFn({ method: 'POST' })
  .validator((data: { libraryId: string; userIds: string[] }) =>
    z
      .object({
        libraryId: z.string(),
        userIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(AddLibraryParticipantsDocument, {
      libraryId: ctx.data.libraryId,
      userIds: ctx.data.userIds,
    }),
  )

const RemoveLibraryParticipantDocument = graphql(`
  mutation removeLibraryParticipant($userId: String!, $libraryId: String!, $currentUserId: String!) {
    removeLibraryParticipant(userId: $userId, libraryId: $libraryId, currentUserId: $currentUserId) {
      id
    }
  }
`)

export const removeLibraryParticipant = createServerFn({ method: 'POST' })
  .validator((data: { userId: string; libraryId: string; currentUserId: string }) =>
    z
      .object({
        userId: z.string(),
        libraryId: z.string(),
        currentUserId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(RemoveLibraryParticipantDocument, {
      userId: ctx.data.userId,
      libraryId: ctx.data.libraryId,
      currentUserId: ctx.data.currentUserId,
    }),
  )
