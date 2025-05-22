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
  mutation removeLibraryParticipant($libraryId: String!, $userId: String!) {
    removeLibraryParticipant(libraryId: $libraryId, userId: $userId) {
      id
    }
  }
`)

export const removeLibraryParticipant = createServerFn({ method: 'POST' })
  .validator((data: { libraryId: string; userId: string }) =>
    z
      .object({
        libraryId: z.string(),
        userId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(RemoveLibraryParticipantDocument, {
      libraryId: ctx.data.libraryId,
      userId: ctx.data.userId,
    }),
  )

const LeaveLibraryParticipantDocument = graphql(`
  mutation leaveLibraryParticipant($libraryId: String!) {
    leaveLibraryParticipant(libraryId: $libraryId) {
      id
    }
  }
`)

export const leaveLibraryParticipant = createServerFn({ method: 'POST' })
  .validator((data: { libraryId: string }) =>
    z
      .object({
        libraryId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(LeaveLibraryParticipantDocument, {
      libraryId: ctx.data.libraryId,
    }),
  )
