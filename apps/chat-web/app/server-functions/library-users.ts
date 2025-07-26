import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from './backend'

const AddLibraryUsersDocument = graphql(`
  mutation addLibraryUsers($libraryId: String!, $userIds: [String!]!) {
    addLibraryUsers(libraryId: $libraryId, userIds: $userIds) {
      id
    }
  }
`)

export const addLibraryUsers = createServerFn({ method: 'POST' })
  .validator((data: { libraryId: string; userIds: string[] }) =>
    z
      .object({
        libraryId: z.string(),
        userIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(AddLibraryUsersDocument, {
      libraryId: ctx.data.libraryId,
      userIds: ctx.data.userIds,
    }),
  )

const RemoveLibraryUserDocument = graphql(`
  mutation removeLibraryUser($libraryId: String!, $userId: String!) {
    removeLibraryUser(libraryId: $libraryId, userId: $userId) {
      id
    }
  }
`)

export const removeLibraryUser = createServerFn({ method: 'POST' })
  .validator((data: { libraryId: string; userId: string }) =>
    z
      .object({
        libraryId: z.string(),
        userId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(RemoveLibraryUserDocument, {
      libraryId: ctx.data.libraryId,
      userId: ctx.data.userId,
    }),
  )

const LeaveLibraryDocument = graphql(`
  mutation leaveLibrary($libraryId: String!) {
    leaveLibrary(libraryId: $libraryId) {
      id
    }
  }
`)

export const leaveLibrary = createServerFn({ method: 'POST' })
  .validator((data: { libraryId: string }) =>
    z
      .object({
        libraryId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(LeaveLibraryDocument, {
      libraryId: ctx.data.libraryId,
    }),
  )
