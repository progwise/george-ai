import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from '../server-functions/backend'

const AddListParticipantsDocument = graphql(`
  mutation addListParticipant($listId: String!, $userIds: [String!]!) {
    addListParticipants(listId: $listId, userIds: $userIds) {
      id
    }
  }
`)

export const addListParticipants = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        listId: z.string(),
        userIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(AddListParticipantsDocument, {
      listId: ctx.data.listId,
      userIds: ctx.data.userIds,
    }),
  )

const RemoveListParticipantDocument = graphql(`
  mutation removeListParticipant($listId: String!, $userId: String!) {
    removeListParticipant(listId: $listId, userId: $userId) {
      id
    }
  }
`)

export const removeListParticipant = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        listId: z.string(),
        userId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(RemoveListParticipantDocument, {
      listId: ctx.data.listId,
      userId: ctx.data.userId,
    }),
  )
