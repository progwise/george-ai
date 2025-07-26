import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from './backend'

const AddAssistantUsersDocument = graphql(`
  mutation addAssistantUsers($assistantId: String!, $userIds: [String!]!) {
    addAssistantUsers(assistantId: $assistantId, userIds: $userIds) {
      id
    }
  }
`)

export const addAssistantUsers = createServerFn({ method: 'POST' })
  .validator((data: { assistantId: string; userIds: string[] }) =>
    z
      .object({
        assistantId: z.string(),
        userIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(AddAssistantUsersDocument, {
      assistantId: ctx.data.assistantId,
      userIds: ctx.data.userIds,
    }),
  )

const RemoveAssistantUserDocument = graphql(`
  mutation removeAssistantUser($assistantId: String!, $userId: String!) {
    removeAssistantUser(assistantId: $assistantId, userId: $userId) {
      id
    }
  }
`)

export const removeAssistantUser = createServerFn({ method: 'POST' })
  .validator((data: { assistantId: string; userId: string }) =>
    z
      .object({
        assistantId: z.string(),
        userId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(RemoveAssistantUserDocument, {
      assistantId: ctx.data.assistantId,
      userId: ctx.data.userId,
    }),
  )

const LeaveAssistantDocument = graphql(`
  mutation leaveAssistant($assistantId: String!) {
    leaveAssistant(assistantId: $assistantId) {
      id
    }
  }
`)

export const leaveAssistant = createServerFn({ method: 'POST' })
  .validator((data: { assistantId: string }) =>
    z
      .object({
        assistantId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(LeaveAssistantDocument, {
      assistantId: ctx.data.assistantId,
    }),
  )
